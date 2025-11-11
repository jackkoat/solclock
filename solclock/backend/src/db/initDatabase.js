/**
 * Database Initialization Script
 * Creates tables and initial schema
 */

const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function initDatabase() {
  try {
    console.log('Initializing database schema...');
    
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('Database schema created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
