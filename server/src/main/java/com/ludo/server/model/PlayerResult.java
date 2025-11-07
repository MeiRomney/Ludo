package com.ludo.server.model;

public class PlayerResult {
    private String name;
    private String color;
    private long finished;
    private long inPlay;
    private long atHome;
    private Integer finishPosition;

    public PlayerResult(String name, String color, long finished, long inPlay, long atHome, Integer finishPosition) {
        this.name = name;
        this.color = color;
        this.finished = finished;
        this.inPlay = inPlay;
        this.atHome = atHome;
        this.finishPosition = finishPosition;
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

    public long getFinished() {
        return finished;
    }
    public void setFinished(long finished) {
        this.finished = finished;
    }

    public long getInPlay() {
        return inPlay;
    }
    public void setInPlay(long inPlay) {
        this.inPlay = inPlay;
    }

    public long getAtHome() {
        return atHome;
    }
    public void setAtHome(long atHome) {
        this.atHome = atHome;
    }

    public Integer getFinishPosition() {
        return finishPosition;
    }
    public void setFinishPosition(Integer finishPosition) {
        this.finishPosition = finishPosition;
    }
}
