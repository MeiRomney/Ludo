package com.ludo.server.model;

import java.util.List;

public class Results {
    private String winner;
    private List<PlayerResult> scoreboard;

    public Results(String winner, List<PlayerResult> scoreboard) {
        this.winner = winner;
        this.scoreboard = scoreboard;
    }

    public String getWinner() {
        return winner;
    }
    public void setWinner(String winner) {
        this.winner = winner;
    }

    public List<PlayerResult> getScoreboard() {
        return scoreboard;
    }
    public void setScoreboard(List<PlayerResult> scoreboard) {
        this.scoreboard = scoreboard;
    }
}
