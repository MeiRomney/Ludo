package com.ludo.server.model;

import java.util.Random;

/**
 * Represents the dice used in the game.
 */
public class Dice {
    private String diceId;
    private int value;

    /**
     * Rolls the dice
     * @return a random value between 1 and 6
     */
    public int roll() {
        // Logic to roll
        Random random = new Random();
        value = random.nextInt(6) + 1;
        return value;
    }

    // Getters and setters

    public String getDiceId() {
        return diceId;
    }
    public void setDiceId(String diceId) {
        this.diceId = diceId;
    }

    public int getValue() {
        return value;
    }
    public void setValue(int value) {
        this.value = value;
    }
}