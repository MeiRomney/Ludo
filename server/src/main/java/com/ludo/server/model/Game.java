package com.ludo.server.model;

import java.util.*;

/**
 * Represents a Ludo game session.
 */
public class Game {
    private String gameId;
    private Board board;
    private List<Player> players;
    private int currentTurn;
    private Map<String, DiceRoll> lastDiceRolls;
    private int lastRollValue;
    private boolean diceRolledThisTurn;
    private boolean Paused;
    private boolean started;

    public Game() {
        this.gameId = UUID.randomUUID().toString();
        this.currentTurn = 0;
        this.board = new Board();
        this.players = new ArrayList<>();
        this.lastDiceRolls = new HashMap<>();
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
    public int rollDiceForPlayer(Player current) {
        Dice dice = new Dice();
        int value = dice.roll();
        String rollId = UUID.randomUUID().toString();

        DiceRoll diceRoll = new DiceRoll(value, rollId);
        lastDiceRolls.put(current.getPlayerId(), diceRoll);

        return diceRoll.getValue();
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

        int totalPlayers = players.size();
        int finishedCount = (int) players.stream()
                .filter(p -> p.getFinishPosition() != null)
                .count();
        Player lastFinishedPlayer = null;

        // Logic to check if a player has all tokens finished
        for(Player player: players) {
            if(player.getFinishPosition() == null){
                boolean allFinished = player.getTokens().stream().allMatch(Token::isFinished);
                if(allFinished) {
                    finishedCount++;
                    player.setFinishPosition(finishedCount);
                    lastFinishedPlayer = player;
                    System.out.println("🏁 " + player.getName() + " finished in position " + finishedCount);
                }
            }
        }

        // Game over condition (1 player left)
        if(finishedCount == players.size() - 1) {
            System.out.println("🏁 Game Over — only one player left unfinished!");
            // Assign last position to the remaining player
            for(Player p: players) {
                if(p.getFinishPosition() == null) {
                    p.setFinishPosition(totalPlayers);
                    System.out.println("😅 " + p.getName() + " finished last (" + totalPlayers + ")");
                }
            }
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

    public Map<String, DiceRoll> getLastDiceRolls() {
        return lastDiceRolls;
    }
    public void setLastDiceRolls(Map<String, DiceRoll> lastDiceRolls) {
        this.lastDiceRolls = lastDiceRolls;
    }

    public int getLastRollValue() {
        return lastRollValue;
    }
    public void setLastRollValue(int lastRollValue) {
        this.lastRollValue = lastRollValue;
    }

    public boolean isDiceRolledThisTurn() {
        return diceRolledThisTurn;
    }
    public void setDiceRolledThisTurn(boolean diceRolledThisTurn) {
        this.diceRolledThisTurn = diceRolledThisTurn;
    }

    public boolean isPaused() {
        return Paused;
    }
    public void setPaused(boolean Paused) {
        this.Paused = Paused;
    }

    public boolean isStarted() {
        return started;
    }
    public void setStarted(boolean started) {
        this.started = started;
    }
}