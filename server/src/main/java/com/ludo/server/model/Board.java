package com.ludo.server.model;

import java.util.List;

/**
 * Represents the Ludo game board.
 */
public class Board {
    private String boardId;
    private List<com.ludo.server.model.Cell> cells;
    private List<com.ludo.server.model.Cell> safeZones;

    /**
     * Initialize the board with cells and safe zones.
     */
    public void initializeBoard() {
        // Logic to initialize board
    }

    /**
     * Displays the board state (for debugging)
     */
    public void displayBoard() {
        // Logic to display board
        System.out.println("Board has " + (cells != null ? cells.size() : 0) + "cells.");
    }

    // Getters and setters

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    public List<com.ludo.server.model.Cell> getCells() {
        return cells;
    }

    public void setCells(List<com.ludo.server.model.Cell> cells) {
        this.cells = cells;
    }

    public List<com.ludo.server.model.Cell> getSafeZones() {
        return safeZones;
    }

    public void setSafeZones(List<com.ludo.server.model.Cell> safeZones) {
        this.safeZones = safeZones;
    }
}