package com.ludo.server.model;

import java.util.List;

public class Game {
    private String gameId;
    private Board board;
    private List<Player> players;
    private int currentTurn;

    public void startGame() {
        // Initialize baord and players
    }

    public int rollDice() {
        Dice dice = new Dice();
        return dice.roll();
    }

    public void moveToken(String playerId, String tokenId, int steps) {
        // Logic to move token on board
    }

    public Player checkWinner() {
        // Logic to check if a player has all tokens finished
        return null;
    }

    // Getters and setters
}