const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const pool = require('./database');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'almarai-secret-key';

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

function requireManager(req, res, next) {
  if (!['manager', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Manager access required' });
  }

  next();
}

function normalizeCustomerType(type) {
  const customerType = String(type || '').trim().toUpperCase();
  return customerType === 'CD' ? 'CD' : 'C';
}

function cleanPhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function phonesMatch(left, right) {
  const a = cleanPhone(left);
  const b = cleanPhone(right);
  if (!a || !b) return false;
  return a === b || (a.length >= 9 && b.length >= 9 && a.slice(-9) === b.slice(-9));
}

function toCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function distanceMeters(fromLat, fromLng, toLat, toLng) {
  const earthRadius = 6371000;
  const lat1 = Number(fromLat) * Math.PI / 180;
  const lat2 = Number(toLat) * Math.PI / 180;
  const deltaLat = (Number(toLat) - Number(fromLat)) * Math.PI / 180;
  const deltaLng = (Number(toLng) - Number(fromLng)) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function createProximityAlertsForLocation({ salesmanId, salesmanName, routeNumber, latitude, longitude }) {
  const customersResult = await pool.query(
    `SELECT id, customer_code, name, route_number, latitude, longitude
     FROM customers
     WHERE route_number = $1
       AND latitude IS NOT NULL
       AND longitude IS NOT NULL`,
    [routeNumber]
  );

  const alerts = [];
  for (const customer of customersResult.rows) {
    const distance = distanceMeters(latitude, longitude, customer.latitude, customer.longitude);
    const possibleAlerts = [
      {
        type: 'nearby_50m',
        threshold: 50,
        message: 'Your Almarai delivery salesman is nearby and should arrive shortly.'
      },
      {
        type: 'arrived_100ft',
        threshold: 30.48,
        message: 'Your Almarai delivery salesman has arrived nearby. Please be ready to receive your order.'
      }
    ];

    for (const alert of possibleAlerts) {
      if (distance > alert.threshold) continue;

      const result = await pool.query(
        `INSERT INTO delivery_proximity_alerts
         (customer_id, salesman_id, route_number, alert_type, distance_meters, message)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (customer_id, salesman_id, alert_type, alert_date) DO NOTHING
         RETURNING id, alert_type, distance_meters, message, created_at`,
        [customer.id, salesmanId, routeNumber, alert.type, distance, alert.message]
      );

      if (result.rows[0]) {
        alerts.push({
          ...result.rows[0],
          customer_code: customer.customer_code,
          customer_name: customer.name,
          salesman_name: salesmanName
        });
      }
    }
  }

  return alerts;
}

function canAccessCustomerRecord(user, customer) {
  if (!user || !customer) return false;
  if (['manager', 'admin'].includes(user.role)) return true;
  return user.role === 'customer' && phonesMatch(user.phone, customer.contact_phone);
}

app.get('/', (req, res) => {
  res.send('ALMARAI VERSION 1000');
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(`${__dirname}/admin-dashboard.html`);
});

app.get('/manager-portal', (req, res) => {
  res.sendFile(`${__dirname}/admin.html`);
});

app.get('/portal-login', (req, res) => {
  res.sendFile(`${__dirname}/login.html`);
});

app.get('/i18n.js', (req, res) => {
  res.sendFile(`${__dirname}/i18n.js`);
});

app.get('/customer-page', (req, res) => {
  res.sendFile(`${__dirname}/customer.html`);
});

app.get('/salesman-dashboard', (req, res) => {
  res.sendFile(`${__dirname}/salesman.html`);
});

app.get('/qr', (req, res) => {
  res.sendFile(`${__dirname}/qr.html`);
});

function gfMultiply(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function gfPower(x, power) {
  let result = 1;
  for (let i = 0; i < power; i++) {
    result = gfMultiply(result, x);
  }
  return result;
}

function polyMultiply(left, right) {
  const result = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      result[i + j] ^= gfMultiply(left[i], right[j]);
    }
  }
  return result;
}

function reedSolomon(data, degree) {
  let generator = [1];
  for (let i = 0; i < degree; i++) {
    generator = polyMultiply(generator, [1, gfPower(2, i)]);
  }

  const message = data.concat(Array(degree).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coefficient = message[i];
    if (coefficient === 0) continue;
    for (let j = 0; j < generator.length; j++) {
      message[i + j] ^= gfMultiply(generator[j], coefficient);
    }
  }

  return message.slice(data.length);
}

function createQrSvg(text) {
  const version = 4;
  const size = 33;
  const dataCodewords = 80;
  const errorCodewords = 20;
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  function set(x, y, dark, reserve = true) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    modules[y][x] = dark;
    if (reserve) reserved[y][x] = true;
  }

  function finder(x, y) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
        const dark = inFinder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        set(xx, yy, dark);
      }
    }
  }

  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);

  for (let i = 8; i < size - 8; i++) {
    set(i, 6, i % 2 === 0);
    set(6, i, i % 2 === 0);
  }

  for (const cy of [6, 26]) {
    for (const cx of [6, 26]) {
      if ((cx === 6 && cy === 6) || (cx === 26 && cy === 6) || (cx === 6 && cy === 26)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  set(8, size - 8, true);

  const bytes = Array.from(Buffer.from(text, 'utf8'));
  if (bytes.length > 78) {
    throw new Error('QR text is too long');
  }

  const bits = [0, 1, 0, 0];
  for (let i = 7; i >= 0; i--) bits.push((bytes.length >>> i) & 1);
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((byte >>> i) & 1);
  }
  for (let i = 0; i < 4 && bits.length < dataCodewords * 8; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(Number.parseInt(bits.slice(i, i + 8).join(''), 2));
  }
  for (let pad = 0xec; data.length < dataCodewords; pad ^= 0xec ^ 0x11) {
    data.push(pad);
  }

  const allCodewords = data.concat(reedSolomon(data, errorCodewords));
  const allBits = allCodewords.flatMap((byte) => {
    const out = [];
    for (let i = 7; i >= 0; i--) out.push((byte >>> i) & 1);
    return out;
  });

  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let vert = 0; vert < size; vert++) {
      const y = upward ? size - 1 - vert : vert;
      for (let x = right; x >= right - 1; x--) {
        if (reserved[y][x]) continue;
        const bit = bitIndex < allBits.length ? allBits[bitIndex++] === 1 : false;
        modules[y][x] = bit !== ((x + y) % 2 === 0);
      }
    }
    upward = !upward;
  }

  const formatData = (1 << 3) | 0;
  let rem = formatData;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  }
  const formatBits = ((formatData << 10) | rem) ^ 0x5412;

  function formatBit(i) {
    return ((formatBits >>> i) & 1) === 1;
  }

  for (let i = 0; i <= 5; i++) set(8, i, formatBit(i));
  set(8, 7, formatBit(6));
  set(8, 8, formatBit(7));
  set(7, 8, formatBit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, formatBit(i));

  const cell = 10;
  const quiet = 4;
  const imageSize = (size + quiet * 2) * cell;
  const rects = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) {
        rects.push(`<rect x="${(x + quiet) * cell}" y="${(y + quiet) * cell}" width="${cell}" height="${cell}"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imageSize} ${imageSize}" width="${imageSize}" height="${imageSize}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${rects.join('')}</g></svg>`;
}

app.get('/qr-svg', (req, res) => {
  try {
    const data = String(req.query.data || '').trim();
    if (!data) {
      return res.status(400).send('Missing QR data');
    }

    res.type('image/svg+xml').send(createQrSvg(data));
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/qr-png', async (req, res) => {
  try {
    const data = String(req.query.data || '').trim();
    if (!data) {
      return res.status(400).send('Missing QR data');
    }

    const png = await QRCode.toBuffer(data, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 4,
      scale: 10,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.type('image/png').send(png);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/register', async (req, res) => {
  try {
    const { full_name, phone, password } = req.body;

    if (!full_name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, phone, password)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, phone`,
      [full_name, phone, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const role = user.role || 'customer';
    const redirectUrl = role === 'manager'
      ? '/manager-portal'
      : role === 'admin'
        ? '/admin-dashboard'
        : role === 'salesman'
          ? '/salesman-dashboard'
          : '/customer-page';

    res.json({
      message: 'Login successful',
      token,
      role,
      redirectUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, phone, role FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading profile' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading products' });
  }
});

app.get('/customers/by-code/:customerCode', async (req, res) => {
  try {
    const { customerCode } = req.params;

    const result = await pool.query(
      `SELECT id, customer_code, name, route_number, area, customer_type, current_balance, credit_limit, contact_phone, location_link
       FROM customers
       WHERE customer_code = $1`,
      [customerCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading customer' });
  }
});

app.patch('/customers/by-code/:customerCode/location', authenticateToken, async (req, res) => {
  try {
    const { customerCode } = req.params;
    const latitude = toCoordinate(req.body.latitude);
    const longitude = toCoordinate(req.body.longitude);

    if (latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    const customerResult = await pool.query(
      `SELECT id, customer_code, contact_phone
       FROM customers
       WHERE customer_code = $1`,
      [customerCode]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!canAccessCustomerRecord(req.user, customerResult.rows[0])) {
      return res.status(403).json({ message: 'You can only save location for your own customer account' });
    }

    const result = await pool.query(
      `UPDATE customers
       SET latitude = $1,
           longitude = $2
       WHERE customer_code = $3
       RETURNING id, customer_code, name, route_number`,
      [latitude, longitude, customerCode]
    );

    res.json({
      message: 'Delivery location saved',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save delivery location' });
  }
});

app.get('/customer/proximity-alerts', authenticateToken, async (req, res) => {
  try {
    const customerCode = String(req.query.customerCode || '').trim();
    if (!customerCode) {
      return res.status(400).json({ message: 'Customer code is required' });
    }

    const customerResult = await pool.query(
      `SELECT id, customer_code, contact_phone
       FROM customers
       WHERE customer_code = $1`,
      [customerCode]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!canAccessCustomerRecord(req.user, customerResult.rows[0])) {
      return res.status(403).json({ message: 'You can only view alerts for your own customer account' });
    }

    const result = await pool.query(
      `SELECT
        delivery_proximity_alerts.*,
        users.full_name AS salesman_name
       FROM delivery_proximity_alerts
       LEFT JOIN users ON users.id = delivery_proximity_alerts.salesman_id
       WHERE delivery_proximity_alerts.customer_id = $1
         AND delivery_proximity_alerts.alert_date = CURRENT_DATE
         AND delivery_proximity_alerts.acknowledged_at IS NULL
       ORDER BY delivery_proximity_alerts.created_at DESC`,
      [customerResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch proximity alerts' });
  }
});

app.patch('/customer/proximity-alerts/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const alertResult = await pool.query(
      `SELECT
        delivery_proximity_alerts.id,
        customers.contact_phone
       FROM delivery_proximity_alerts
       JOIN customers ON customers.id = delivery_proximity_alerts.customer_id
       WHERE delivery_proximity_alerts.id = $1`,
      [id]
    );

    if (alertResult.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (!canAccessCustomerRecord(req.user, alertResult.rows[0])) {
      return res.status(403).json({ message: 'You can only acknowledge your own alerts' });
    }

    const result = await pool.query(
      `UPDATE delivery_proximity_alerts
       SET acknowledged_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({ message: 'Alert acknowledged', alert: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to acknowledge alert' });
  }
});

app.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { total_amount } = req.body;

    const result = await pool.query(
      `INSERT INTO orders (user_id, total_amount)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, total_amount]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

app.post('/orders-with-items', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one order item is required' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          message: `Product ${item.product_id} not found`
        });
      }

      const product = productResult.rows[0];
      const quantity = Number(item.quantity || 0);

      if (quantity <= 0) {
        return res.status(400).json({ message: 'Item quantity must be greater than zero' });
      }

      totalAmount += Number(product.price) * quantity;
      orderItems.push({ product, quantity, productId: item.product_id });
    }

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_amount)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, totalAmount]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, item.product.price]
      );
    }

    res.status(201).json({
      message: 'Order with items created successfully',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

app.post('/custom-requests', async (req, res) => {
  try {
    const {
      customer_id,
      customer_name,
      phone,
      category,
      message,
      preferred_contact
    } = req.body;

    if (!customer_name || !message) {
      return res.status(400).json({ message: 'Customer name and message are required' });
    }

    const result = await pool.query(
      `INSERT INTO custom_requests
       (customer_id, customer_name, phone, category, message, preferred_contact)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        customer_id || null,
        customer_name,
        phone || '',
        category || '',
        message,
        preferred_contact || 'WhatsApp'
      ]
    );

    res.status(201).json({
      message: 'Custom request submitted successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit custom request' });
  }
});

app.get('/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        orders.id,
        orders.user_id,
        users.full_name AS customer_name,
        users.phone AS customer_phone,
        orders.total_amount,
        orders.status,
        orders.created_at
      FROM orders
      LEFT JOIN users ON users.id = orders.user_id
      ORDER BY orders.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.patch('/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

app.get('/admin/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.get('/admin/areas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM areas
      ORDER BY route_number
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch areas' });
  }
});

app.post('/admin/areas', authenticateToken, requireManager, async (req, res) => {
  try {
    const { route_number, area_name, city, notes } = req.body;

    if (!route_number || !area_name) {
      return res.status(400).json({ message: 'Route number and area name are required' });
    }

    const result = await pool.query(
      `INSERT INTO areas (route_number, area_name, city, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [route_number, area_name, city || 'Riyadh', notes || '']
    );

    res.status(201).json({
      message: 'Area created successfully',
      area: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create area' });
  }
});

app.get('/admin/users', authenticateToken, requireManager, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, phone, role, created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.post('/admin/users', authenticateToken, requireManager, async (req, res) => {
  try {
    const { full_name, phone, password, role } = req.body;

    if (!full_name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    const allowedRoles = ['manager', 'admin', 'salesman', 'customer'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, phone, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, phone, role, created_at`,
      [full_name, phone, hashedPassword, userRole]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/admin/products', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock_quantity,
      image_url
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const result = await pool.query(
      `INSERT INTO products
       (name, description, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name,
        description || '',
        price || 0,
        stock_quantity || 0,
        image_url || ''
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

app.patch('/admin/products/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock_quantity,
      image_url
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           stock_quantity = $4,
           image_url = $5
       WHERE id = $6
       RETURNING *`,
      [
        name,
        description || '',
        price || 0,
        stock_quantity || 0,
        image_url || '',
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

app.delete('/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

app.get('/admin/customers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM customers
      ORDER BY route_number, customer_code
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.post('/admin/customers', async (req, res) => {
  try {
    const {
      customer_code,
      name,
      route_number,
      area,
      customer_type,
      current_balance,
      credit_limit,
      contact_phone,
      location_link,
      notes
    } = req.body;

    if (!customer_code || !name) {
      return res.status(400).json({ message: 'Customer code and name are required' });
    }

    const result = await pool.query(
      `INSERT INTO customers
       (customer_code, name, route_number, area, customer_type, current_balance, credit_limit, contact_phone, location_link, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        customer_code,
        name,
        route_number || '950',
        area || 'Wadi Laban, Riyadh',
        normalizeCustomerType(customer_type),
        current_balance || 0,
        credit_limit || 0,
        contact_phone || '',
        location_link || '',
        notes || ''
      ]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

app.patch('/admin/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_code,
      name,
      route_number,
      area,
      customer_type,
      current_balance,
      credit_limit,
      contact_phone,
      location_link,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET customer_code = $1,
           name = $2,
           route_number = $3,
           area = $4,
           customer_type = $5,
           current_balance = $6,
           credit_limit = $7,
           contact_phone = $8,
           location_link = $9,
           notes = $10
       WHERE id = $11
       RETURNING *`,
      [
        customer_code,
        name,
        route_number || '950',
        area || 'Wadi Laban, Riyadh',
        normalizeCustomerType(customer_type),
        current_balance || 0,
        credit_limit || 0,
        contact_phone || '',
        location_link || '',
        notes || '',
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

app.delete('/admin/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer deleted successfully',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

app.get('/admin/custom-requests', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        custom_requests.*,
        customers.customer_code,
        customers.route_number,
        customers.location_link
      FROM custom_requests
      LEFT JOIN customers ON customers.id = custom_requests.customer_id
      ORDER BY custom_requests.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch custom requests' });
  }
});

app.patch('/admin/custom-requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const handledAt = status === 'Handled' ? new Date() : null;

    const result = await pool.query(
      `UPDATE custom_requests
       SET status = $1,
           handled_at = $2
       WHERE id = $3
       RETURNING *`,
      [status || 'Pending', handledAt, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Custom request not found' });
    }

    res.json({
      message: 'Custom request status updated',
      request: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update custom request' });
  }
});

app.get('/route-stock', authenticateToken, async (req, res) => {
  try {
    const routeNumber = req.query.route || '950';
    const stockDate = req.query.date || new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT
        route_stock.*,
        products.name AS product_name
       FROM route_stock
       LEFT JOIN products ON products.id = route_stock.product_id
       WHERE route_stock.route_number = $1
         AND route_stock.stock_date = $2
       ORDER BY products.name`,
      [routeNumber, stockDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch route stock' });
  }
});

app.post('/route-stock/movement', authenticateToken, async (req, res) => {
  try {
    const {
      route_number,
      product_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      notes
    } = req.body;

    if (!product_id || !movement_type || !quantity) {
      return res.status(400).json({ message: 'Product, movement type, and quantity are required' });
    }

    const routeNumber = route_number || '950';
    const movementQuantity = Number(quantity);
    const today = new Date().toISOString().slice(0, 10);

    await pool.query(
      `INSERT INTO route_stock (route_number, product_id, stock_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (route_number, product_id, stock_date) DO NOTHING`,
      [routeNumber, product_id, today]
    );

    const columnByType = {
      opening: 'opening_quantity',
      depot_received: 'received_quantity',
      transfer_in: 'transferred_in_quantity',
      transfer_out: 'transferred_out_quantity',
      delivered: 'delivered_quantity',
      returned: 'returned_quantity'
    };

    const column = columnByType[movement_type];
    if (!column) {
      return res.status(400).json({ message: 'Invalid movement type' });
    }

    await pool.query(
      `UPDATE route_stock
       SET ${column} = ${column} + $1,
           closing_quantity = opening_quantity + received_quantity + transferred_in_quantity + returned_quantity - transferred_out_quantity - delivered_quantity
       WHERE route_number = $2
         AND product_id = $3
         AND stock_date = $4`,
      [movementQuantity, routeNumber, product_id, today]
    );

    await pool.query(
      `UPDATE route_stock
       SET closing_quantity = opening_quantity + received_quantity + transferred_in_quantity + returned_quantity - transferred_out_quantity - delivered_quantity
       WHERE route_number = $1
         AND product_id = $2
         AND stock_date = $3`,
      [routeNumber, product_id, today]
    );

    const movement = await pool.query(
      `INSERT INTO stock_movements
       (route_number, product_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [routeNumber, product_id, movement_type, movementQuantity, reference_type || '', reference_id || null, notes || '', req.user.id]
    );

    res.status(201).json({
      message: 'Stock movement recorded',
      movement: movement.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to record stock movement' });
  }
});

app.get('/customer-visits', authenticateToken, async (req, res) => {
  try {
    const routeNumber = req.query.route || '950';
    const result = await pool.query(
      `SELECT
        customer_visits.*,
        customers.customer_code,
        customers.name AS customer_name
       FROM customer_visits
       LEFT JOIN customers ON customers.id = customer_visits.customer_id
       WHERE customer_visits.route_number = $1
         AND customer_visits.visited_at::date = CURRENT_DATE
       ORDER BY customer_visits.visited_at DESC`,
      [routeNumber]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch visits' });
  }
});

app.post('/customer-visits', authenticateToken, async (req, res) => {
  try {
    const { customer_id, route_number, visit_status, notes } = req.body;

    if (!customer_id) {
      return res.status(400).json({ message: 'Customer is required' });
    }

    const result = await pool.query(
      `INSERT INTO customer_visits
       (customer_id, route_number, visit_status, notes, visited_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [customer_id, route_number || '950', visit_status || 'Visited', notes || '', req.user.id]
    );

    res.status(201).json({
      message: 'Visit recorded',
      visit: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to record visit' });
  }
});

app.post('/salesman/location', authenticateToken, async (req, res) => {
  try {
    if (!['salesman', 'manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Salesman location access required' });
    }

    const latitude = toCoordinate(req.body.latitude);
    const longitude = toCoordinate(req.body.longitude);
    const accuracy = toCoordinate(req.body.accuracy);
    const routeNumber = String(req.body.route_number || '950').trim() || '950';

    if (latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    const userResult = await pool.query(
      'SELECT full_name FROM users WHERE id = $1',
      [req.user.id]
    );
    const salesmanName = userResult.rows[0]?.full_name || req.user.phone || 'Salesman';

    const locationResult = await pool.query(
      `INSERT INTO salesman_locations
       (salesman_id, salesman_name, route_number, latitude, longitude, accuracy)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (salesman_id)
       DO UPDATE SET
         salesman_name = EXCLUDED.salesman_name,
         route_number = EXCLUDED.route_number,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         accuracy = EXCLUDED.accuracy,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, salesmanName, routeNumber, latitude, longitude, accuracy]
    );

    const alerts = await createProximityAlertsForLocation({
      salesmanId: req.user.id,
      salesmanName,
      routeNumber,
      latitude,
      longitude
    });

    res.json({
      message: 'Salesman location updated',
      location: locationResult.rows[0],
      alertsCreated: alerts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update salesman location' });
  }
});

app.get('/salesman/transfers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM stock_transfers
      ORDER BY id DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch transfer requests' });
  }
});

app.post('/salesman/transfers', authenticateToken, async (req, res) => {
  try {
    const {
      request_type,
      source_type,
      from_route,
      from_salesman,
      to_route,
      to_salesman,
      product,
      quantity,
      unit,
      notes
    } = req.body;

    if (!request_type) {
      return res.status(400).json({ message: 'Request type is required' });
    }

    const result = await pool.query(
      `INSERT INTO stock_transfers
       (request_type, source_type, from_route, from_salesman, to_route, to_salesman, product, quantity, unit, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Requested', $10, $11)
       RETURNING *`,
      [
        request_type,
        source_type || 'nearby_salesman',
        from_route || '',
        from_salesman || '',
        to_route || '950',
        to_salesman || '',
        product || '',
        Number(quantity || 0),
        unit || 'cartons',
        notes || '',
        req.user.id
      ]
    );

    res.status(201).json({
      message: 'Transfer/support request created',
      transfer: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create transfer request' });
  }
});

app.patch('/salesman/transfers/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE stock_transfers
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status || 'Requested', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    res.json({
      message: 'Transfer/support status updated',
      transfer: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update transfer status' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
