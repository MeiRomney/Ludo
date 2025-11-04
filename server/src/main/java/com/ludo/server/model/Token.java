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
        if(position > 56) {
            position = 56;
            isFinished = true;
        }
    }

    public boolean canMove(int steps) {
        // If token is already finished, can't move
        if(isFinished) {
            return false;
        }

        // If token is at home
        if(position == -1) {
            // Can only come out if it rolled a 6
            return steps == 6;
        }

        // Regular move
        return position + steps <= 56; // Adjust limit for the board
    }

    /**
     * Resets the token to its starting position
     */
    public void resetPosition() {
        // Logic to reset position
        this.position = -1;
        this.isActive = false;
    }

    /**
     * Gets the absolute position
     * @return absolute position
     */
    public int getAbsolutePosition(int startOffset) {
        if(position == -1 || isFinished) return -1;
        return (startOffset + position) % 56;
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