const pool = require('./database');

async function setupDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        route_number VARCHAR(30) DEFAULT '',
        area VARCHAR(150) DEFAULT '',
        can_receive_transfers BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS access_requests (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        requested_role VARCHAR(20) DEFAULT 'customer',
        route_number VARCHAR(30) DEFAULT '',
        area VARCHAR(150) DEFAULT '',
        customer_code VARCHAR(30) DEFAULT '',
        notes TEXT DEFAULT '',
        status VARCHAR(30) DEFAULT 'Pending',
        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP,
        created_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT DEFAULT '',
        price NUMERIC(10, 2) DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        image_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        route_number VARCHAR(30) UNIQUE NOT NULL,
        area_name VARCHAR(150) NOT NULL,
        city VARCHAR(100) DEFAULT 'Riyadh',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_name VARCHAR(150) DEFAULT '',
        customer_phone VARCHAR(30) DEFAULT '',
        route_number VARCHAR(30) DEFAULT '',
        total_amount NUMERIC(10, 2) DEFAULT 0,
        payment_method VARCHAR(40) DEFAULT 'Cash',
        invoice_number VARCHAR(40) DEFAULT '',
        invoice_notes TEXT DEFAULT '',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by_role VARCHAR(30) DEFAULT '',
        status VARCHAR(30) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        customer_code VARCHAR(30) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        route_number VARCHAR(30) DEFAULT '950',
        area VARCHAR(150) DEFAULT 'Wadi Laban, Riyadh',
        customer_type VARCHAR(2) NOT NULL CHECK (customer_type IN ('C', 'CD')),
        current_balance NUMERIC(10, 2) DEFAULT 0,
        credit_limit NUMERIC(10, 2) DEFAULT 0,
        contact_phone VARCHAR(30) DEFAULT '',
        location_link TEXT DEFAULT '',
        latitude NUMERIC(10, 7),
        longitude NUMERIC(10, 7),
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS custom_requests (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        customer_name VARCHAR(150) NOT NULL,
        phone VARCHAR(30) DEFAULT '',
        category VARCHAR(100) DEFAULT '',
        message TEXT NOT NULL,
        preferred_contact VARCHAR(30) DEFAULT 'WhatsApp',
        status VARCHAR(30) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        handled_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stock_transfers (
        id SERIAL PRIMARY KEY,
        request_type VARCHAR(40) NOT NULL,
        source_type VARCHAR(30) DEFAULT 'nearby_salesman',
        from_route VARCHAR(30) DEFAULT '',
        from_salesman VARCHAR(100) DEFAULT '',
        from_salesman_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        to_route VARCHAR(30) DEFAULT '950',
        to_salesman VARCHAR(100) DEFAULT '',
        to_salesman_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        product VARCHAR(120) DEFAULT '',
        quantity INTEGER DEFAULT 0,
        unit VARCHAR(30) DEFAULT 'cartons',
        status VARCHAR(40) DEFAULT 'Requested',
        notes TEXT DEFAULT '',
        transfer_channel VARCHAR(40) DEFAULT 'nearby_salesman',
        logistics_approved BOOLEAN DEFAULT false,
        requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transfer_partners (
        id SERIAL PRIMARY KEY,
        from_salesman_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_salesman_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        from_route VARCHAR(30) DEFAULT '',
        to_route VARCHAR(30) DEFAULT '',
        notes TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (from_salesman_id, to_salesman_id)
      );

      CREATE TABLE IF NOT EXISTS route_stock (
        id SERIAL PRIMARY KEY,
        route_number VARCHAR(30) NOT NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        opening_quantity INTEGER DEFAULT 0,
        received_quantity INTEGER DEFAULT 0,
        transferred_in_quantity INTEGER DEFAULT 0,
        transferred_out_quantity INTEGER DEFAULT 0,
        delivered_quantity INTEGER DEFAULT 0,
        returned_quantity INTEGER DEFAULT 0,
        closing_quantity INTEGER DEFAULT 0,
        stock_date DATE DEFAULT CURRENT_DATE,
        UNIQUE (route_number, product_id, stock_date)
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        route_number VARCHAR(30) DEFAULT '950',
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        movement_type VARCHAR(40) NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type VARCHAR(40) DEFAULT '',
        reference_id INTEGER,
        notes TEXT DEFAULT '',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customer_visits (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        route_number VARCHAR(30) DEFAULT '950',
        visit_status VARCHAR(40) DEFAULT 'Visited',
        notes TEXT DEFAULT '',
        visited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS salesman_locations (
        id SERIAL PRIMARY KEY,
        salesman_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        salesman_name VARCHAR(100) DEFAULT '',
        route_number VARCHAR(30) DEFAULT '950',
        latitude NUMERIC(10, 7) NOT NULL,
        longitude NUMERIC(10, 7) NOT NULL,
        accuracy NUMERIC(10, 2),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (salesman_id)
      );

      CREATE TABLE IF NOT EXISTS delivery_proximity_alerts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        salesman_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        route_number VARCHAR(30) DEFAULT '950',
        alert_type VARCHAR(30) NOT NULL,
        distance_meters NUMERIC(10, 2),
        message TEXT NOT NULL,
        alert_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        acknowledged_at TIMESTAMP,
        UNIQUE (customer_id, salesman_id, alert_type, alert_date)
      );

      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS current_balance NUMERIC(10, 2) DEFAULT 0;

      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10, 2) DEFAULT 0;

      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);

      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS route_number VARCHAR(30) DEFAULT '';

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS area VARCHAR(150) DEFAULT '';

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS can_receive_transfers BOOLEAN DEFAULT true;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150) DEFAULT '';

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30) DEFAULT '';

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS route_number VARCHAR(30) DEFAULT '';

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(40) DEFAULT 'Cash';

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(40) DEFAULT '';

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS invoice_notes TEXT DEFAULT '';

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS created_by_role VARCHAR(30) DEFAULT '';

      ALTER TABLE stock_transfers
      ADD COLUMN IF NOT EXISTS from_salesman_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

      ALTER TABLE stock_transfers
      ADD COLUMN IF NOT EXISTS to_salesman_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

      ALTER TABLE stock_transfers
      ADD COLUMN IF NOT EXISTS transfer_channel VARCHAR(40) DEFAULT 'nearby_salesman';

      ALTER TABLE stock_transfers
      ADD COLUMN IF NOT EXISTS logistics_approved BOOLEAN DEFAULT false;

      ALTER TABLE stock_transfers
      ADD COLUMN IF NOT EXISTS requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

      INSERT INTO areas (route_number, area_name, city, notes)
      VALUES ('950', 'Wadi Laban', 'Riyadh', 'Default route area')
      ON CONFLICT (route_number) DO NOTHING;
    `);

    console.log('Almarai database tables are ready.');
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
