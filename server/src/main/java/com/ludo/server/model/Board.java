package com.ludo.server.model;

import java.util.ArrayList;
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
        if(cells == null) {
            cells = new ArrayList<>();
        }

        if(safeZones == null) {
            safeZones = new ArrayList<>();
        }

        for(int i = 0; i < 56; i++) {
            Cell cell = new Cell();
            cell.setCellId("cell-" + i);
            cell.setPosition(i);
            cell.setType("normal");
            cells.add(cell);
        }
        System.out.println("Board initialized with " + cells.size() + " cells.");
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