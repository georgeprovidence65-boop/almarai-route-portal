const fs = require('fs');
const path = require('path');
const pool = require('./database');

const tables = [
  'areas',
  'users',
  'customers',
  'products',
  'orders',
  'order_items',
  'custom_requests',
  'stock_transfers',
  'route_stock',
  'stock_movements',
  'customer_visits'
];

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function backupData() {
  const backupRoot = process.env.BACKUP_DIR || path.join(__dirname, 'backups');
  const backupDir = path.join(backupRoot, `almarai-backup-${timestamp()}`);

  fs.mkdirSync(backupDir, { recursive: true });

  for (const table of tables) {
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
    const filePath = path.join(backupDir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
  }

  const manifest = {
    created_at: new Date().toISOString(),
    tables,
    note: 'JSON backup exported from Almarai route portal.'
  };

  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`Backup created: ${backupDir}`);
}

backupData()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
