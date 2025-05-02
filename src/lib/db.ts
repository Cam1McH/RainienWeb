// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'ventra',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

