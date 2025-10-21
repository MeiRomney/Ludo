package com.ludo.server.model;

import java.util.List;

/**
 * Represents a Ludo game session.
 */
public class Game {
    private String gameId;
    private Board board;
    private List<Player> players;
    private int currentTurn;

    /**
     * Start by initializing the board and players
     */
    public void startGame() {
        // Initialize baord and players
        if(board == null) {
            board.initializeBoard();
        }
        this.currentTurn = 0;
    }

    /**
     * Roll the dice for the current player.
     * @return rolled value between 1 and 6
     */
    public int rollDice() {
        Dice dice = new Dice();
        return dice.roll();
    }

    /**
     * move a player's token by a certain number of steps.
     * @param playerId
     * @param tokenId
     * @param steps
     */
    public void moveToken(String playerId, String tokenId, int steps) {
        // Logic to move token on board
        Player player = players.stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst().orElse(null);

        if(player != null) {
            player.moveToken(tokenId, steps);
        }
    }

    /**
     * check if any player has won the game.
     * @return the winner, or null if none yet
     */
    public Player checkWinner() {
        // Logic to check if a player has all tokens finished
        for(Player player: players) {
            boolean allFinished = player.getTokens().stream().allMatch(Token::isFinished);
            if(allFinished) {
                return player;
            }
        }
        return null;
    }

    // Getters and setters

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public Board getBoard() {
        return board;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public void setPlayers(List<Player> players) {
        this.players = players;
    }

    public int getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(int currentTurn) {
        this.currentTurn = currentTurn;
    }
}