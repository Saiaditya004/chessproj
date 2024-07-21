
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
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


async function saveGameDetails(gameId, eventID, result, moves, whitePlayerID, blackPlayerID) {
    const query = `
        INSERT INTO games (event_id, game_id, date, result, white_player_id, black_player_id, moves)
        VALUES ($1, $2, NOW(), $3, $4, $5, $6)
    `;
    const values = [eventID, gameId, result, whitePlayerID, blackPlayerID, moves];
    console.log('saveGameDetails query:', query);
    console.log('values:', values);
    try {
        await pool.query(query, values);
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

export { saveGameDetails, saveMove };
