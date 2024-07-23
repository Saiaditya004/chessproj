const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.post('/register', async (req, res) => {
    const { username, password, email, date_of_birth, country } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, password, email, date_of_birth, country, rating) VALUES ($1, $2, $3, $4, $5, 1000) RETURNING *',
            [username, hashedPassword, email, date_of_birth, country]
        );

        const userId = newUser.rows[0].id;

        const newUserStats = await pool.query(
            'INSERT INTO UserStatistics(UserID, TotalGames, Wins, Losses, Draws, HighestRating, CurrentRating) VALUES ($1, 0, 0, 0, 0, 1000, 1000) RETURNING *',
            [userId]
        );

        res.json({ user: newUser.rows[0], stats: newUserStats.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
