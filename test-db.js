const pool = require('./database');

async function test() {
  console.log("Starting test...");

  try {
    const result = await pool.query('SELECT NOW()');

    console.log("Database Connected!");
    console.log(result.rows[0]);

  } catch (error) {
    console.error(error);
  }
}

test();