package com.ludo.server.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a Ludo game session.
 */
public class Game {
    private String gameId;
    private Board board;
    private List<Player> players;
    private int currentTurn;

    public Game() {
        this.gameId = UUID.randomUUID().toString();
        this.currentTurn = 0;
        this.board = new Board();
        this.players = new ArrayList<>();
    }

    /**
     * Start by initializing the board and players
     */
    public void startGame() {
        System.out.println("🎮 Starting game...");

        if (board == null) {
            System.out.println("Board is null, creating a new one...");
            board = new Board();
        }

        board.initializeBoard();
        System.out.println("✅ Board initialized successfully!");

        if(players == null || players.isEmpty()) {
            System.out.println("⚠️ No players found, creating default players...");

            Player red = new Player();
            red.setPlayerId(UUID.randomUUID().toString());
            red.setName("Red Player");
            red.setColor("red");

            Player blue = new Player();
            blue.setPlayerId(UUID.randomUUID().toString());
            blue.setName("Blue Player");
            blue.setColor("blue");

            Player yellow = new Player();
            yellow.setPlayerId(UUID.randomUUID().toString());
            yellow.setName("Yellow Player");
            yellow.setColor("yellow");

            Player green = new Player();
            green.setPlayerId(UUID.randomUUID().toString());
            green.setName("Green Player");
            green.setColor("green");

            players = List.of(red, blue, yellow, green);
        }
        System.out.println("✅ Game started with " + players.size() + " players.");

        for(Player player : players) {
            player.initializeTokens();
        }
        System.out.println("🎯 Tokens initialized for all players.");
    }

    /**
     * Roll the dice for the current player.
     * @return rolled value between 1 and 6
     */
    public int rollDice() {
        Dice dice = new Dice();
        return dice.roll();
    }

    /**
     * move a player's token by a certain number of steps.
     * @param playerId
     * @param tokenId
     * @param steps
     */
    public void moveToken(String playerId, String tokenId, int steps) {
        if(players == null || players.isEmpty()) return;
        // Logic to move token on board
        Player player = players.stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElse(null);
        if(player == null) {
            System.out.println("⚠️ Player not found: " + playerId);
            return;
        }
        player.moveToken(tokenId, steps);

        System.out.println("After move:");
        for(Player p: players) {
            for(Token t: p.getTokens()) {
                System.out.println(p.getColor() + " token " + t.getTokenId() + " moved to " + t.getPosition());
            }
        }
    }

    /**
     * check if any player has won the game.
     * @return the winner, or null if none yet
     */
    public Player checkWinner() {
        if(players == null || players.isEmpty()) return null;

        int finishedCount = 0;
        Player lastFinishedPlayer = null;

        // Logic to check if a player has all tokens finished
        for(Player player: players) {
            boolean allFinished = player.getTokens().stream().allMatch(Token::isFinished);
            if(allFinished) {
                finishedCount++;
                lastFinishedPlayer = player;
            }
        }

        if(finishedCount == players.size() - 1) {
            System.out.println("🏁 Game Over — only one player left unfinished!");
        }
        return lastFinishedPlayer;
    }

    // Getters and setters

    public String getGameId() {
        return gameId;
    }
    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public Board getBoard() {
        return board;
    }
    public void setBoard(Board board) {
        this.board = board;
    }

    public List<Player> getPlayers() {
        return players;
    }
    public void setPlayers(List<Player> players) {
        this.players = players;
    }

    public int getCurrentTurn() {
        return currentTurn;
    }
    public void setCurrentTurn(int currentTurn) {
        this.currentTurn = currentTurn;
    }
}