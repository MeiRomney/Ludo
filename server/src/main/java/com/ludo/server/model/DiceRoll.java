package com.ludo.server.model;

public class DiceRoll {
    private int value;
    private String rollId;

    public DiceRoll(int value, String rollId) {
        this.value = value;
        this.rollId = rollId;
    }

    public int getValue() {
        return value;
    }
    public void setValue(int value) {
        this.value = value;
    }

    public String getRollId() {
        return rollId;
    }
    public void setRollId(String rollId) {
        this.rollId = rollId;
    }
}
