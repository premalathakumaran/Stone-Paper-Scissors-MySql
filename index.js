
// app.js

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
});

// Ensure database table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1 VARCHAR(255) NOT NULL,
    player2 VARCHAR(255) NOT NULL,
    rounds JSON NOT NULL
  )
`, (error, results, fields) => {
  if (error) {
    console.error('Error creating table:', error);
  } else {
    console.log('Table created successfully');
  }
});

app.use(bodyParser.json());

// Routes
app.post('/api/game', (req, res) => {
  const { player1, player2, rounds } = req.body;
  const insertQuery = 'INSERT INTO games (player1, player2, rounds) VALUES (?, ?, ?)';
  pool.query(insertQuery, [player1, player2, JSON.stringify(rounds)], (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: 'Error saving game' });
    } else {
      res.status(201).json({ message: 'Game saved successfully' });
    }
  });
});

app.get('/api/games', (req, res) => {
  const selectQuery = 'SELECT * FROM games';
  pool.query(selectQuery, (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching games' });
    } else {
      res.json(results);
    }
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
