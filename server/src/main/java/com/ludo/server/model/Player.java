package com.ludo.server.model;

import java.util.List;

/**
 * Represents a player in the Ludo game.
 */
public class Player {
    private String playerId;
    private String name;
    private String color;
    private List<Token> tokens;
    private int score;

    /**
     * Rolls the dice for this player.
     * @return rolled dice value
     */
    public int rollDice() {
        Dice dice = new Dice();
        return dice.roll();
    }

    /**
     * Moves one of this player's token
     */
    public void moveToken(String tokenId, int steps) {
        // Logic to move tokens
        for(Token token : tokens) {
            if(token.getTokenId().equals(tokenId) && token.isActive()) {
                token.move(steps);
                break;
            }
        }
    }

    /**
     * Captures an opponent's token (simplified placeholder)
     */
    public void captureOpponentToken(Token opponentToken) {
        // Logic to capture opponents' tokens
        opponentToken.resetPosition();
    }

    /**
     * Mark a token as finished.
     * @param token
     */
    public void finishToken(Token token) {
        // Logic to finish tokens
        token.setFinished(true);
        score++;
    }

    // Getters and setters

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public List<Token> getTokens() {
        return tokens;
    }

    public void setTokens(List<Token> tokens) {
        this.tokens = tokens;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}