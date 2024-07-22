CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    date_of_birth DATE,
    country VARCHAR(100),
    rating INTEGER DEFAULT 1000
);

CREATE TABLE IF NOT EXISTS games (
    event_id INTEGER,
    game_id BIGINT PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(50),
    white_player_id INTEGER,
    black_player_id INTEGER,
    moves TEXT,
    constraint fk_white_player_id foreign key (white_player_id) references users(id),
    constraint fk_black_player_id foreign key (black_player_id) references users(id)
);

CREATE TABLE moves (
    move_id BIGINT PRIMARY KEY,
    game_id BIGINT,
    player_id INTEGER,
    move_number INTEGER,
    move VARCHAR(255),
    constraint fk_game_ig foreign key (game_id) references games(game_id)
);