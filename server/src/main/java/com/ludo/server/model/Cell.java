package com.ludo.server.model;

/**
 * Represents a single cell on the board.
 */
public class Cell {
    private String cellId;
    private int position;
    private String type; // normal, safe, home, etc.

    /**
     * Sets a token on this cell.
     * @param token
     */
    public void setToken(Token token) {
        // Logic to set tokens
        token.setPosition(position);
        token.setActive(true);
    }

    /**
     * Removes a token from this cell.
     * @param token
     */
    public void removeToken(Token token) {
        // Logic to remove tokens
        token.setActive(false);
    }

    // Getters and setters

    public String getCellId() {
        return cellId;
    }
    public void setCellId(String cellId) {
        this.cellId = cellId;
    }

    public int getPosition() {
        return position;
    }
    public void setPosition(int position) {
        this.position = position;
    }

    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
}