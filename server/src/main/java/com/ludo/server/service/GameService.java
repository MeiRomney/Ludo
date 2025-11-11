package com.ludo.server.service;

import com.ludo.server.model.*;
import com.ludo.server.repository.PlayerSettingRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GameService {
    private Game currentGame;
    private boolean paused = false;
    private int lastRollValue = 0;
    private boolean diceRolledThisTurn = false;

    private static final Set<Integer> SAFE_CELLS = Set.of(0, 8, 13, 21, 26, 34, 39, 47);

    private final PlayerSettingRepository playerSettingRepository;

    public GameService(PlayerSettingRepository playerSettingRepository) {
        this.playerSettingRepository = playerSettingRepository;
    }

    /**
     * Starts a new game
     *
     * @return the current game
     */
    public Game startNewGame(String email) {
        System.out.println("⚙️ Starting new game for email: " + email);
        try {
            // Fetch user from database
            var optional = playerSettingRepository.findByEmail(email);
            if (optional.isEmpty()) {
                System.out.println("❌ playerSettingRepository.findByEmail returned empty for: " + email);
                throw new IllegalStateException("User not found with email: " + email);
            }
            PlayerSetting humanSetting = optional.get();
            System.out.println("✅ Found PlayerSetting: " + humanSetting);

            // Defensive checks
            if (humanSetting.getColor() == null) {
                throw new IllegalStateException("User has no color set: " + humanSetting);
            }
            if (humanSetting.getName() == null) {
                System.out.println("⚠️ name is null — will use color-based default");
            }

            currentGame = new Game();
            List<Player> players = new ArrayList<>();

            Player human = createHuman(humanSetting.getName(), humanSetting.getColor());
            System.out.println("👤 Created human player: " + human.getName() + " color=" + human.getColor());
            players.add(human);

            int gameType = Objects.equals(humanSetting.getGameType(), "fourPlayers") ? 4 : 2;
            System.out.println("🏷️ gameType="+gameType + " from saved: " + humanSetting.getGameType());

            if (gameType == 2) {
                String botColor = getTwoPlayerBotColor(human.getColor());
                players.add(createBot(botColor + " bot", botColor, getStartOffset(botColor)));
            } else {
                for (String color : List.of("red", "blue", "yellow", "green")) {
                    if (!color.equals(human.getColor())) {
                        players.add(createBot(color + " bot", color, getStartOffset(color)));
                    }
                }
            }

            System.out.println("Players before startGame():");
            players.forEach(p -> System.out.println(" - " + p.getName() + " (" + p.getColor() + ")"));

            currentGame.setPlayers(players);

            // IMPORTANT: log right before calling startGame()
            System.out.println("Calling currentGame.startGame() ...");
            currentGame.startGame(); // <--- if this throws, stacktrace will show exact cause

            System.out.println("✅ Game started successfully!");
            // rest unchanged...
            Player firstPlayer = getCurrentPlayer();
            if (firstPlayer.isBot()) {
                new Timer().schedule(new TimerTask() {
                    @Override
                    public void run() {
                        synchronized (GameService.this) {
                            // Double check to ensure it's still this bot's turn
                            if (getCurrentPlayer().getPlayerId().equals(firstPlayer.getPlayerId())) {
                                handleBotTurn(firstPlayer);
                            }
                        }
                    }
                }, 1000 + new Random().nextInt(1000));
            }
            return currentGame;
        } catch (Exception ex) {
            System.out.println("❗ startNewGame failed for email: " + email + " -> " + ex.getMessage());
            ex.printStackTrace();
            throw ex; // rethrow so controller can send JSON error
        }
    }


    private Player createHuman(String humanName, String humanColor) {
        Player human = new Player();
        human.setPlayerId(UUID.randomUUID().toString());
        human.setName(humanName != null ? humanName : humanColor +  " Player");
        human.setColor(humanColor);
        human.initializeTokens();
        human.setStartOffset(getStartOffset(humanColor));
        human.setBot(false);
        return human;
    }

    private Player createBot(String name, String color, int startOffset) {
        Player bot = new Player();
        bot.setPlayerId(UUID.randomUUID().toString());
        bot.setName(name);
        bot.setColor(color);
        bot.initializeTokens();
        bot.setStartOffset(startOffset);
        bot.setBot(true);
        return bot;
    }

    private int getStartOffset(String color) {
        return switch (color.toLowerCase()) {
            case "red" -> 0;
            case "blue" -> 13;
            case "yellow" -> 26;
            case "green" -> 39;
            default -> 0;
        };
    }

    private String getTwoPlayerBotColor(String humanColor) {
        return switch (humanColor.toLowerCase()) {
          case "red" -> "yellow";
          case "yellow" -> "red";
          case "blue" -> "green";
          case "green" -> "blue";
          default -> "yellow";
        };
    }

    /**
     * rolls the dice for the current player and moves to next turn
     *
     * @return the value of the rolled dice
     */
    public synchronized int rollDice(String playerId) {
        if(paused) {
            throw new IllegalStateException("⚠️ Game is currently paused!");
        }

        if (currentGame == null) {
            throw new IllegalStateException("Game has not been started yet!");
        }

        Player current = getCurrentPlayer();

        // Ensures only current player can roll
        if (!current.getPlayerId().equals(playerId)) {
            throw new IllegalStateException("❌ It's not your turn!");
        }

        // Ensure they haven't already rolled this turn
        if (diceRolledThisTurn) {
            throw new IllegalStateException("⚠️ You've already rolled the dice this turn!");
        }

        int value = currentGame.rollDiceForPlayer(current);
        lastRollValue = value;
        diceRolledThisTurn = true;

        System.out.println("🎲 " + current.getName() + " rolled a " + value);

        // Check if any token can move right now
        var movableTokens = current.getTokens().stream()
                .filter(t -> t.canMove(value))
                .toList();

        if (movableTokens.isEmpty()) {
            System.out.println("⚠️ No possible moves for " + current.getName() + " with roll " + value);
            if (value != 6) {
                nextTurn();
            } else {
                System.out.println("🎁 " + current.getName() + " rolled 6 but can’t move — still gets another turn!");
                if (current.isBot()) {
                    new Timer().schedule(new TimerTask() {
                        @Override
                        public void run() {
                            synchronized (GameService.this) {
                                // Double check to ensure it's still this bot's turn
                                if (getCurrentPlayer().getPlayerId().equals(current.getPlayerId())) {
                                    handleBotTurn(current);
                                }
                            }
                        }
                    }, 1000 + new Random().nextInt(1000));
                }
            }
            lastRollValue = 0;
            diceRolledThisTurn = false;
        }

        return value;
    }

    /**
     * Moves a token for the current player using the provided steps
     * if steps == 6 the same player keeps the turn; otherwise move to the next player
     *
     * @param playerId
     * @param tokenId
     * @param steps
     */
    public void moveToken(String playerId, String tokenId, int steps) {
        if(paused) {
            throw new IllegalStateException("⚠️ Game is currently paused!");
        }

        if (currentGame == null) {
            throw new IllegalStateException("Game has not been started yet!");
        }

        Player current = getCurrentPlayer();

        if (!current.getPlayerId().equals(playerId)) {
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
        if (movableTokens.isEmpty()) {
            System.out.println("⚠️ No possible moves for " + current.getName() + " with roll " + steps);

            if (steps == 6) {
                System.out.println("🎁 " + current.getName() + " rolled 6 but can’t move — still gets another turn!");
                // If it's a bot, trigger its turn automatically after a delay
                if (current.isBot()) {
                    new Timer().schedule(new TimerTask() {
                        @Override
                        public void run() {
                            synchronized (GameService.this) {
                                // Double check to ensure it's still this bot's turn
                                if (getCurrentPlayer().getPlayerId().equals(current.getPlayerId())) {
                                    handleBotTurn(current);
                                }
                            }
                        }
                    }, 1000 + new Random().nextInt(1000));
                }
            } else {
                nextTurn();
            }
            lastRollValue = 0;
            return;
        }

        // Auto-select if only one movable token
        if (!token.canMove(steps)) {
            token = movableTokens.get(0);
        }

        // Perform the single token movement (only once)
        currentGame.moveToken(playerId, token.getTokenId(), steps);

        // Capture Logic
        int newPos = token.getAbsolutePosition(current.getStartOffset());

        // Only check captures if not in a safe zone
        if (!SAFE_CELLS.contains(newPos)) {
            for (Player p : currentGame.getPlayers()) {
                if (p == current) continue;

                for (var opponentToken : p.getTokens()) {
                    int opponentPos = opponentToken.getAbsolutePosition(p.getStartOffset());
                    if (opponentPos == newPos && opponentToken.getPosition() < 51 && token.getPosition() < 51) {
                        opponentToken.resetPosition(); // Sends back home
                        System.out.println("💥 " + current.getName() + " captured " + p.getName() + "'s token!");
                    }
                }
            }
        }

        // Debug logging of positions after the move
        System.out.println("After move: ");
        for (Player p : currentGame.getPlayers()) {
            p.getTokens().forEach(t -> System.out.println(p.getColor() + " token " + t.getTokenId() + " -> " + t.getPosition()));
        }

        // Check if player finished all tokens
        Player winner = currentGame.checkWinner();
        if (winner != null) {
            System.out.println("🏆 " + winner.getName() + " has finished all their tokens!");

            long unfinishedPlayers = currentGame.getPlayers().stream()
                    .filter(p -> p.getTokens().stream().anyMatch(t -> !t.isFinished()))
                    .count();

            if (unfinishedPlayers == 1) {
                System.out.println("🏁 Game Over! Only one player remains unfinished!");
                return;
            } else {
                System.out.println("🎯 Game continues — " + unfinishedPlayers + " players still in play!");
            }
        }

        // Extra turn logic if 6 is rolled, same players plays again
        if (lastRollValue == 6) {
            System.out.println("🎁 " + current.getName() + " rolled a 6 and gets another turn!");
            // If it's a bot, trigger its turn automatically after a delay
            if (current.isBot()) {
                new Timer().schedule(new TimerTask() {
                    @Override
                    public void run() {
                        synchronized (GameService.this) {
                            // Double check to ensure it's still this bot's turn
                            if (getCurrentPlayer().getPlayerId().equals(current.getPlayerId())) {
                                handleBotTurn(current);
                            }
                        }
                    }
                }, 1000 + new Random().nextInt(1000));
            }
        } else {
            nextTurn();
        }

        // Clear last rolled value to avoid accidental reuse
        lastRollValue = 0;
        diceRolledThisTurn = false;
    }

    /**
     * checks if there is a winner
     *
     * @return the winner
     */
    public Player checkWinner() {
        if (currentGame == null) {
            return null;
        }
        return currentGame.checkWinner();
    }

    /**
     * Moves to the next player's turn
     */
    public synchronized void nextTurn() {
        if (currentGame == null || currentGame.getPlayers() == null || currentGame.getPlayers().isEmpty()) return;

        int totalPlayers = currentGame.getPlayers().size();
        int next = (currentGame.getCurrentTurn() + 1) % totalPlayers;

        // Skip players who finished all tokens
        int safety = 0;
        while (currentGame.getPlayers().get(next).getTokens().stream().allMatch(t -> t.isFinished()) && safety < totalPlayers) {
            next = (next + 1) % totalPlayers;
            safety++;
        }

        currentGame.setCurrentTurn(next);
        diceRolledThisTurn = false;
        lastRollValue = 0;

        Player nextPlayer = getCurrentPlayer();
        System.out.println("➡️ Next turn: " + nextPlayer.getName());

        if (nextPlayer.isBot()) {
            new Timer().schedule(new TimerTask() {
                @Override
                public void run() {
                    synchronized (GameService.this) {
                        // Double check : ensure it's still this bot's turn before proceeding
                        if (getCurrentPlayer().getPlayerId().equals(nextPlayer.getPlayerId())) {
                            handleBotTurn(nextPlayer);
                        }
                    }
                }
            }, 1000 + new Random().nextInt(1000));
        }
    }

    /**
     * Simple bot logic: auto roll and auto move
     */
    private void handleBotTurn(Player bot) {
        if(paused) return;
        try {
            System.out.println("🤖 " + bot.getName() + " is thinking...");
            Thread.sleep(300);

            int roll = rollDice(bot.getPlayerId());
            var movable = bot.getTokens().stream().filter(t -> t.canMove(roll)).toList();

            if (!movable.isEmpty()) {
                Token chosen = movable.get(new Random().nextInt(movable.size()));
                Thread.sleep(500 + new Random().nextInt(1000)); // 0.5-1.5s delay
                moveToken(bot.getPlayerId(), chosen.getTokenId(), roll);
            } else {
                System.out.println("⚠️ No moves for " + bot.getName());
            }
        } catch (Exception e) {
            System.out.println("🤖 Bot turn error for " + bot.getName() + ": " + e.getMessage());
        }
    }

    public Results buildResults(Game current) {
        List<PlayerResult> scoreboard = current.getPlayers().stream()
                .map(player -> {
                    long finished = player.getTokens().stream().filter(Token::isFinished).count();
                    long atHome = player.getTokens().stream().filter(t -> !t.isActive() && !t.isFinished()).count();
                    long inPlay = 4 - finished - atHome;

                    return new PlayerResult(
                            player.getName(),
                            player.getColor(),
                            finished,
                            inPlay,
                            atHome,
                            player.getFinishPosition()
                    );
                })
                .sorted(
                        Comparator
                                .comparing(
                                        (PlayerResult p) -> p.getFinishPosition() == null ? Integer.MAX_VALUE : p.getFinishPosition()
                                )
                                .thenComparing(
                                        Comparator.comparingLong(PlayerResult::getFinished).reversed()
                                )
                )
                .collect(Collectors.toList());
        String winner = current.getPlayers().stream()
                .filter(p -> p.getFinishPosition() != null && p.getFinishPosition() == 1)
                .map(Player::getName)
                .findFirst()
                .orElse(null);

        return new Results(winner, scoreboard);
    }

    private Player getCurrentPlayer() {
        return currentGame.getPlayers().get(currentGame.getCurrentTurn());
    }

    public Game getCurrentGame() {
        return currentGame;
    }

    public synchronized boolean isPaused() {
        return paused;
    }
    public synchronized void setPaused(boolean pause) {
        this.paused = pause;
        System.out.println(pause ? "⏸️ Game paused" : "▶️ Game resumed");

        // Safety check
        if(currentGame == null || currentGame.getPlayers() == null) {
            System.out.println("⚠️ No active game to pause/resume.");
            return;
        }

        if(!pause) {
            // Resume logic: check if it's bot turn
            Player current = getCurrentPlayer();
            if(current != null && current.isBot()) {
                System.out.println("🤖 Resuming bot turn for " + current.getName());
                new Timer().schedule(new TimerTask() {
                    @Override
                    public void run() {
                        synchronized (GameService.this) {
                            if(getCurrentPlayer().getPlayerId().equals(current.getPlayerId()) && !paused) {
                                handleBotTurn(current);
                            }
                        }
                    }
                }, 1000);
            }
        }
    }
}