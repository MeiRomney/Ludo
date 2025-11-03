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
    private int lastRollValue = 0;

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
        lastRollValue = value;

        Player current = getCurrentPlayer();
        System.out.println("🎲 " + current.getName() + " rolled a " + value);
        return value;
    }

    /**
     * Moves a token for the current player using the provided steps
     * if steps == 6 the same player keeps the turn; otherwise move to the next player
     * @param playerId
     * @param tokenId
     * @param steps
     */
    public void moveToken(String playerId, String tokenId, int steps) {
        if(currentGame == null) {
            throw new IllegalStateException("Game has not been started yet!");
        }

        Player current = getCurrentPlayer();

        if(!current.getPlayerId().equals(playerId)) {
            throw new IllegalStateException("❌ It's not " + playerId + "'s turn!");
        }

        // Find the chosen token
        var token = current.getTokens().stream()
                .filter(t -> t.getTokenId().equals(tokenId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("❌ Invalid tokenId for player"));

        // Determine which tokens are movable
        var movableTokens = current.getTokens().stream()
                .filter(t -> t.canMove(steps))
                .toList();

        // Auto-select if only one movable token
        if(movableTokens.size() == 1 && !token.canMove(steps)) {
            token = movableTokens.get(0);
        }

        // Check if movement is possible
        if(!token.canMove(steps)) {
            System.out.println("⚠️ Token cannot move " + steps + " steps.");
            // If the player rolled 6 and can't move any token, still allow another turn
            if(lastRollValue == 6) {
                System.out.println("🎁 " + current.getName() + " rolled 6 but can't move — still gets another turn!");
                lastRollValue = 0;
                return;
            } else {
                nextTurn();
                lastRollValue = 0;
                return;
            }
        }

        // Perform the single token movement (only once)
        currentGame.moveToken(playerId, token.getTokenId(), steps);

        // Debug logging of positions after the move
        System.out.println("After move: ");
        for(Player p : currentGame.getPlayers()) {
            p.getTokens().forEach(t -> System.out.println(p.getColor() + " token " + t.getTokenId() + " -> " + t.getPosition()));
        }

        // Check if player won
        Player winner = currentGame.checkWinner();
        if(winner != null) {
            System.out.println("🏆 Winner found: " + winner.getName());
            return;
        }

        // Extra turn logic if 6 is rolled, same players plays again
        if(lastRollValue == 6) {
            System.out.println("🎁 " + current.getName() + " rolled a 6 and gets another turn!");
        } else {
            nextTurn();
        }

        // Clear last rolled value to avoid accidental reuse
        lastRollValue = 0;
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

        Player nextPlayer = getCurrentPlayer();
        System.out.println("➡️ Next turn: " + nextPlayer.getName());
    }

    private Player getCurrentPlayer() {
        return currentGame.getPlayers().get(currentGame.getCurrentTurn());
    }

    public Game getCurrentGame() {
        return currentGame;
    }
}