package com.ludo.server.service;

import com.ludo.server.model.Board;
import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class GameService {
    private Game currentGame;
    private int lastRollValue = 0;
    private boolean diceRolledThisTurn = false;

    private static final Set<Integer> SAFE_CELLS = Set.of(0, 8, 13, 21, 26, 34, 39, 47);

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
        red.setStartOffset(0);

        Player blue = new Player();
        blue.setPlayerId(UUID.randomUUID().toString());
        blue.setName("Blue Player");
        blue.setColor("blue");
        blue.initializeTokens();
        blue.setStartOffset(13);

        Player yellow = new Player();
        yellow.setPlayerId(UUID.randomUUID().toString());
        yellow.setName("Yellow Player");
        yellow.setColor("yellow");
        yellow.initializeTokens();
        yellow.setStartOffset(26);

        Player green = new Player();
        green.setPlayerId(UUID.randomUUID().toString());
        green.setName("Green Player");
        green.setColor("green");
        green.initializeTokens();
        green.setStartOffset(39);

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
    public synchronized int rollDice(String playerId) {
        if(currentGame == null) {
            throw new IllegalStateException("Game has not been started yet!");
        }

        Player current = getCurrentPlayer();

        // Ensures only current player can roll
        if(!current.getPlayerId().equals(playerId)) {
            throw new IllegalStateException("❌ It's not your turn!");
        }

        // Ensure they haven't already rolled this turn
        if(diceRolledThisTurn) {
            throw new IllegalStateException("⚠️ You've already rolled the dice this turn!");
        }

        int value = currentGame.rollDice();
        lastRollValue = value;
        diceRolledThisTurn = true;

        System.out.println("🎲 " + current.getName() + " rolled a " + value);

        // Check if any token can move right now
        var movableTokens = current.getTokens().stream()
                .filter(t -> t.canMove(value))
                .toList();

        if(movableTokens.isEmpty()) {
            System.out.println("⚠️ No possible moves for " + current.getName() + " with roll " + value);
            if (value != 6) {
                nextTurn();
            } else {
                System.out.println("🎁 " + current.getName() + " rolled 6 but can’t move — still gets another turn!");
            }
            lastRollValue = 0;
            diceRolledThisTurn = false;
        }

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

        // If no token can move, skip automatically
        if(movableTokens.isEmpty()) {
            System.out.println("⚠️ No possible moves for " + current.getName() + " with roll " + steps);

            if(steps == 6) {
                System.out.println("🎁 " + current.getName() + " rolled 6 but can’t move — still gets another turn!");
            } else {
                nextTurn();
            }
            lastRollValue = 0;
            return;
        }

        // Auto-select if only one movable token
        if(!token.canMove(steps)) {
            token = movableTokens.get(0);
        }

        // Perform the single token movement (only once)
        currentGame.moveToken(playerId, token.getTokenId(), steps);

        // Capture Logic
        int newPos = token.getAbsolutePosition(current.getStartOffset());

        // Only check captures if not in a safe zone
        if(!SAFE_CELLS.contains(newPos)) {
            for(Player p: currentGame.getPlayers()) {
                if(p == current) continue;

                for(var opponentToken: p.getTokens()) {
                    int opponentPos = opponentToken.getAbsolutePosition(p.getStartOffset());
                    if(opponentPos == newPos && opponentToken.getPosition() < 51 && token.getPosition() < 51) {
                        opponentToken.resetPosition(); // Sends back home
                        System.out.println("💥 " + current.getName() + " captured " + p.getName() + "'s token!");
                    }
                }
            }
        }

        // Debug logging of positions after the move
        System.out.println("After move: ");
        for(Player p : currentGame.getPlayers()) {
            p.getTokens().forEach(t -> System.out.println(p.getColor() + " token " + t.getTokenId() + " -> " + t.getPosition()));
        }

        // Check if player finished all tokens
        Player winner = currentGame.checkWinner();
        if(winner != null) {
            System.out.println("🏆 " + winner.getName() + " has finished all their tokens!");

            long unfinishedPlayers = currentGame.getPlayers().stream()
                    .filter(p -> p.getTokens().stream().anyMatch(t -> !t.isFinished()))
                    .count();

            if(unfinishedPlayers == 1) {
                System.out.println("🏁 Game Over! Only one player remains unfinished!");
                return;
            } else {
                System.out.println("🎯 Game continues — " + unfinishedPlayers + " players still in play!");
            }
        }

        // Extra turn logic if 6 is rolled, same players plays again
        if(lastRollValue == 6) {
            System.out.println("🎁 " + current.getName() + " rolled a 6 and gets another turn!");
        } else {
            nextTurn();
        }

        // Clear last rolled value to avoid accidental reuse
        lastRollValue = 0;
        diceRolledThisTurn = false;
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

        int totalPlayers = currentGame.getPlayers().size();
        int next = (currentGame.getCurrentTurn() + 1) % totalPlayers;

        // Skip players who finished all tokens
        int safety = 0;
        while(currentGame.getPlayers().get(next).getTokens().stream().allMatch(t -> t.isFinished()) && safety < totalPlayers) {
            next = (next + 1) % totalPlayers;
            safety++;
        }

        currentGame.setCurrentTurn(next);
        diceRolledThisTurn = false;

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