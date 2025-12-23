/* config/database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },

  // Opsional tapi bagus untuk performa
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;*/
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // TAMBAHAN PENTING UNTUK MENCEGAH MALFORMED PACKET:
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Jika pakai Aiven/Cloud DB, kadang perlu SSL:
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

export default db;
