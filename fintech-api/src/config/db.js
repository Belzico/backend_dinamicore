const { Pool } = require('pg');
require('dotenv').config();
console.log('Desde db.js - DB_USER:', process.env.DB_PASSWORD);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',//false
  max: 20, // numero max de conexiones
  idleTimeoutMillis: 30000
});

module.exports = pool;
