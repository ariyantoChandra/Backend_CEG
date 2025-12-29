// config/database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Beri default port 3306
  
  /* Hapus/Komentar bagian SSL di bawah ini jika menggunakan 
     MySQL bawaan cPanel Jagoan Hosting. 
  */
  /*
  ssl: {
    rejectUnauthorized: false,
  },
  */

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;