package com.ludo.server.model;

import java.util.List;

public class Player {
    private String playerId;
    private String name;
    private String color;
    private List<Token> tokens;
    private int score;

    public int rollDice() {
        Dice dice = new Dice();
        return dice.roll;
    }

    public void moveToken() {
        // Logic to move tokens
    }

    public void captureOpponentToken() {
        // Logic to capture opponents' tokens
    }

    public void finishToken() {
        // Logic to finish tokens
    }

    // Getters and setters
}