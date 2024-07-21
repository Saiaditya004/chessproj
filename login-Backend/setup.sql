CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS games (
    event_id INTEGER,
    game_id BIGINT PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(50),
    white_player_id INTEGER,
    black_player_id INTEGER,
    moves TEXT
);

CREATE TABLE moves (
    move_id BIGINT PRIMARY KEY,
    game_id BIGINT,
    player_id INTEGER,
    move_number INTEGER,
    move VARCHAR(255)  -- Increased length to 255
);