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
    result INT,
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

CREATE TABLE UserStatistics (
    UserID INT PRIMARY KEY REFERENCES users(id),
    TotalGames INT,
    Wins INT,
    Losses INT,
    Draws INT,
    HighestRating INT,
    CurrentRating INT
);

--for userstatistics----
CREATE OR REPLACE FUNCTION trigger_function_example()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.HighestRating < NEW.CurrentRating) THEN
    NEW.HighestRating := NEW.CurrentRating;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER update_highest_rating_trigger
BEFORE UPDATE ON your_table_name
FOR EACH ROW
EXECUTE FUNCTION trigger_function_example();



--new trigger--
CREATE OR REPLACE FUNCTION trigger_for_games()
RETURNS TRIGGER AS $$
DECLARE
    w_no_of_games INT;
    w_wins INT;
    w_losses INT;
    w_draws INT;
    b_no_of_games INT;
    b_wins INT;
    b_losses INT;
    b_draws INT;
    whiteID INT;
    blackID INT;
BEGIN
    whiteID := NEW.white_player_id;
    blackID := NEW.black_player_id;

    -- Default to 0 if no games are found
    SELECT COALESCE(COUNT(*), 0) INTO w_no_of_games FROM games WHERE white_player_id = whiteID;
    SELECT COALESCE(COUNT(*), 0) INTO b_no_of_games FROM games WHERE black_player_id = blackID;
    
    SELECT COALESCE(COUNT(*), 0) INTO w_wins FROM games WHERE result = whiteID;
    SELECT COALESCE(COUNT(*), 0) INTO b_wins FROM games WHERE result = blackID;
    
    SELECT COALESCE(COUNT(*), 0) INTO w_draws FROM games WHERE result = 0 AND white_player_id = whiteID;
    SELECT COALESCE(COUNT(*), 0) INTO b_draws FROM games WHERE result = 0 AND black_player_id = blackID;

    w_losses := w_no_of_games - w_wins - w_draws;
    b_losses := b_no_of_games - b_wins - b_draws;

    -- Update the user statistics
    UPDATE UserStatistics
    SET TotalGames = w_no_of_games, Wins = w_wins, Losses = w_losses, Draws = w_draws
    WHERE UserID = whiteID;

    UPDATE UserStatistics
    SET TotalGames = b_no_of_games, Wins = b_wins, Losses = b_losses, Draws = b_draws
    WHERE UserID = blackID;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER update_user_statistics
AFTER INSERT OR UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION trigger_for_games();
