package com.ludo.server.model;

import java.util.UUID;

/**
 * Represents a player's token in the Ludo game.
 */
public class Token {
    private String tokenId;
    private int position;
    private boolean isActive;
    private boolean isFinished;
    private String playerId;

    public Token() {
        this.tokenId = UUID.randomUUID().toString();
        this.position = -1;
        this.isFinished = false;
    }

    /**
     * Moves the token forward by a given number of steps.
     * @param steps
     */
    public void move(int steps) {
        // Logic to move
        if(isActive && !isFinished) {
            position += steps;
        }
        if(position > 52) {
            position = 52;
            isFinished = true;
        }
    }

    /**
     * Resets the token to its starting position
     */
    public void resetPosition() {
        // Logic to reset position
        this.position = 0;
        this.isActive = false;
    }

    // Getters and setters

    public String getTokenId() {
        return tokenId;
    }
    public void setTokenId(String tokenId) {
        this.tokenId = tokenId;
    }

    public int getPosition() {
        return position;
    }
    public void setPosition(int position) {
        this.position = position;
    }

    public boolean isActive() {
        return isActive;
    }
    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isFinished() {
        return isFinished;
    }
    public void setFinished(boolean finished) {
        isFinished = finished;
    }

    public String getPlayerId() {
        return playerId;
    }
    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }
}