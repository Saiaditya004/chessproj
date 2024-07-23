
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
//impoerts for userstatistics
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

//end of imports for userstatistics
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10)
});


console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

async function saveGameDetails(gameId, eventID, whitePlayerID, blackPlayerID) {
    const query = `
        INSERT INTO games (event_id, game_id, date, result, white_player_id, black_player_id, moves)
        VALUES ($1, $2, NOW(), null,$3, $4, null)
    `;
    const values = [eventID, gameId, whitePlayerID, blackPlayerID];
    console.log('saveGameDetails query:', query);
    console.log('values:', values);
    try {
        await pool.query(query, values);
    } catch (err) {
        console.error('Error saving game details:', err);
    }
}


async function updateGameDetails(gameId, eventID, result, moves, whitePlayerID, blackPlayerID) {

    let white_rating;
    let black_rating

    try {
        const rat1 = await pool.query('SELECT rating FROM users WHERE id = $1', [whitePlayerID]);
        white_rating=rat1.rows[0]?.rating;
        console.log(white_rating);
        const rat2 = await pool.query('SELECT rating FROM users WHERE id = $1', [blackPlayerID]);
        black_rating=rat2.rows[0]?.rating;
        console.log(black_rating);
      } catch (err) {
        console.error(err.message);
        console.log('Database query error');
      }


if(result===1){
    white_rating=white_rating+10;
    black_rating=black_rating-10;
}
else if(result===2){   
    white_rating=white_rating-10;
    black_rating=black_rating+10;
}

const query1 = `
        UPDATE games SET result = $3, moves = $6 WHERE event_id = $1 AND game_id = $2 AND white_player_id = $4 AND black_player_id = $5
    `;
    const query2 = `
        UPDATE users SET rating = $1 WHERE id = $2
    `;
    const query3 = `
        UPDATE users SET rating = $1 WHERE id = $2
    `;
    const query4 = `
        UPDATE UserStatistics SET CurrentRating = $1 WHERE UserID = $2
    `;
    const query5 = `
        UPDATE UserStatistics SET CurrentRating = $1 WHERE UserID = $2
    `;
    const value_white = [white_rating, whitePlayerID];
    const value_black = [black_rating, blackPlayerID];
    const values = [eventID, gameId, result, whitePlayerID, blackPlayerID, moves];
    console.log('updateGameDetails query:', query1);
    console.log('values:', values);
    console.log('white rating change query:', query2);
    console.log('values:', value_white);
    console.log('black rating change query:', query3);
    console.log('values:', value_black);
    try {
        await pool.query(query1, values);
        await pool.query(query2, value_white);
        await pool.query(query3, value_black);
        await pool.query(query4, value_white);
        await pool.query(query5, value_black);
    } catch (err) {
        console.error('Error saving game details:', err);
    }
}
async function saveMove(gameId, moveId, moveNumber, playerId, move, timestamp) {
    const query = `
        INSERT INTO moves (move_id, game_id, player_id, move_number, move)
        VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [moveId, gameId, playerId, moveNumber, move];
    console.log('saveMove query:', query);
    console.log('values:', values);
    try {
        await pool.query(query, values);
    } catch (err) {
        console.error('Error saving move:', err);
    }
}


//for userstatistics

let result1;

app.get('/table-details', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM UserStatistics');
      console.log(result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Error executing query', err);
      res.status(500).send('Internal Server Error');
    }
  });
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });


export { updateGameDetails,saveGameDetails, saveMove };
