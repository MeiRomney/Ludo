package com.ludo.server.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a player in the Ludo game.
 */
public class Player {
    private String playerId;
    private String name;
    private String color;
    private List<Token> tokens;
    private int score;

    public Player() {
        this.tokens = new ArrayList<>();
        this.score = 0;
    }

    /**
     * Initialize four tokens for this player
     */
    public void initializeTokens() {
        this.tokens = new ArrayList<>();
        for(int i = 0; i < 4; i++) {
            Token token = new Token();
            token.setTokenId(UUID.randomUUID().toString());
            token.setPlayerId(this.playerId);
            token.setPosition(-1);
            token.setFinished(false);
            tokens.add(token);
        }
        System.out.println("Tokens initialized for " + name);
    }

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
        Token token = tokens.stream()
                .filter(t -> t.getTokenId().equals(tokenId))
                .findFirst()
                .orElse(null);

        if(token == null) {
            System.out.println("Token not found: " + tokenId);
            return;
        }

        // If the token is still at home (-1), move it out when the player rolls a 6
        if(token.getPosition() == -1) {
            if(steps == 6) {
                token.setPosition(0);
                token.setActive(true);
                System.out.println("Token " + tokenId + " entered the board.");
            } else {
                System.out.println("You need to roll a 6 to move token " + tokenId + "out.");
            }
            return;
        }

        // Move active token normally
        if(token.isActive() && !token.isFinished()) {
            int newPosition = token.getPosition() + steps;
            if(newPosition >= 52) {
                token.setPosition(52);
                token.setFinished(true);
                System.out.println("Token " + tokenId + " reached the end.");
            } else {
                token.setPosition(newPosition);
                System.out.println("Token " + tokenId + "moved to " + newPosition);
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