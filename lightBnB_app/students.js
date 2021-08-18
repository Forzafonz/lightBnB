const input = process.argv[2];
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const textQuery = `SELECT id, title, active FROM properties WHERE id = $1;`


pool.query(textQuery, [input])
  .then((res) => console.log(res.rows))
  .catch((err) => console.log(err));