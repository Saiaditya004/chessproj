import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from './messages.js';
import { saveGameDetails, saveMove } from './db.js';



class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.moves = [];
        this.gameId = Date.now();
        this.eventID = 1;
        this.timeControl = 'standard';

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'w'
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'b'
            }
        }));
    }

    async makeMove(socket, move) {
        if (this.board.turn() === 'w' && socket !== this.player1) {
            return;
        }
    
        if (this.board.turn() === 'b' && socket !== this.player2) {
            return;
        }
    
        try {
            const result = this.board.move(move);
            if (!result) {
                return;
            }
            const playerId = socket === this.player1 ? 1 : 2;
            const moveNumber = this.board.history().length;
            const moveId = Date.now();
            const timestamp = new Date();
    
            await saveMove(this.gameId, moveId, moveNumber, playerId, this.board.fen(), timestamp);
    
            this.moves.push({
                gameId: this.gameId,
                moveId,
                moveNumber,
                playerId,
                move,
                timestamp
            });
            if (this.board.isGameOver()) {
                const winner = this.board.turn() === 'w' ? 'black' : 'white';
    
                await saveGameDetails(this.gameId, this.eventID, winner, this.board.pgn({ maxWidth: 5, newline: '  ' }), 1, 2); // Use actual IDs
    
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: winner
                    }
                }));
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: winner
                    }
                }));
                return;
            }
    
            if (this.board.turn() === 'b') {
                this.player2.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }));
            } else {
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }));
            }
    
            if (!this.player1 || !this.player2) {
                const winner = !this.player1 ? 'black' : 'white';
                this.player1 && this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: { winner }
                }));
                this.player2 && this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: { winner }
                }));
                return;
            }
        } catch (e) {
            console.error("Error while making move:", e);
            return;
        }
    }
    

    handlePlayerDisconnect(disconnectedSocket) {
        if (disconnectedSocket === this.player1) {
            this.player1 = null;
            if (this.player2) {
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: { winner: 'black' }
                }));
            }
        } else if (disconnectedSocket === this.player2) {
            this.player2 = null;
            if (this.player1) {
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: { winner: 'white' }
                }));
            }
        }
    }
}

export { Game };
