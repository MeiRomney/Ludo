package com.ludo.server.service;

import com.ludo.server.model.Board;
import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GameService {
    private Game currentGame;

    /**
     * Starts a new game with two default players
     * @return the current game
     */
    public Game startNewGame() {
        System.out.println("⚙️ Starting new game...");

        currentGame = new Game();
//        currentGame.setGameId(UUID.randomUUID().toString());
//        currentGame.setBoard(new Board());
        // Create players
        List<Player> players = new ArrayList<>();

        Player red = new Player();
        red.setPlayerId(UUID.randomUUID().toString());
        red.setName("Red Player");
        red.setColor("red");
        red.initializeTokens();

        Player blue = new Player();
        blue.setPlayerId(UUID.randomUUID().toString());
        blue.setName("Blue Player");
        blue.setColor("blue");
        blue.initializeTokens();

        Player yellow = new Player();
        yellow.setPlayerId(UUID.randomUUID().toString());
        yellow.setName("Yellow Player");
        yellow.setColor("yellow");
        yellow.initializeTokens();

        Player green = new Player();
        green.setPlayerId(UUID.randomUUID().toString());
        green.setName("Green Player");
        green.setColor("green");
        green.initializeTokens();

        players.add(red);
        players.add(blue);
        players.add(yellow);
        players.add(green);

        currentGame.setPlayers(players);

        currentGame.startGame();

        System.out.println("✅ Game started successfully!");
        return currentGame;
    }

    /**
     * rolls the dice for the current player and moves to next turn
     * @return the value of the rolled dice
     */
    public int rollDice() {
        if(currentGame == null) {
            throw new IllegalStateException("Game has not been started yet!");
        }

        int value = currentGame.rollDice();
        System.out.println("Dice rolled: " + value);
        return value;
    }

    /**
     * checks if there is a winner
     * @return the winner
     */
    public Player checkWinner() {
        if(currentGame == null) { return null; }
        return currentGame.checkWinner();
    }

    /**
     * Moves to the next player's turn
     */
    public void nextTurn() {
        if(currentGame == null || currentGame.getPlayers() == null || currentGame.getPlayers().isEmpty()) return;
        int next = (currentGame.getCurrentTurn() + 1) % currentGame.getPlayers().size();
        currentGame.setCurrentTurn(next);
    }

    /**
     * Moves a token for a player
     * @param playerId
     * @param tokenId
     * @param steps
     */
    public void moveToken(String playerId, String tokenId, int steps) {
        if(currentGame == null) {
            throw new IllegalStateException("Game has not been started yet!");
        }
        currentGame.moveToken(playerId, tokenId, steps);
        nextTurn();
    }

    public Game getCurrentGame() {
        return currentGame;
    }
}