package com.ludo.server.service;

import com.ludo.server.model.*;
import com.ludo.server.repository.PlayerSettingRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class GameService {
    // Multiple active games keyed by gameId
    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();
    // Map playerId -> gameId (so we can resolve which game a player belongs to)
    private final Map<String, String> playerToGame = new ConcurrentHashMap<>();

    private final PlayerSettingRepository playerSettingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    private static final Set<Integer> SAFE_CELLS = Set.of(0, 8, 13, 21, 26, 34, 39, 47);


    public GameService(PlayerSettingRepository playerSettingRepository, SimpMessagingTemplate messagingTemplate) {
        this.playerSettingRepository = playerSettingRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized Game createMultiplayerGame(String email) {
        PlayerSetting humanSetting = getPlayerSetting(email);

        Game game = new Game();
        String gameId = UUID.randomUUID().toString();
        game.setGameId(gameId);
        game.setPlayers(new ArrayList<>());
        game.setCurrentTurn(0);

        Player human = createHuman(humanSetting.getName(), humanSetting.getColor());
        game.getPlayers().add(human);

        activeGames.put(gameId, game);
        playerToGame.put(human.getPlayerId(), gameId);

        broadcastGameState(game);
        return game;
    }

    public synchronized Game joinExistingGame(String email, String gameId) {
        Game game = activeGames.get(gameId);
        if(game == null) throw new IllegalStateException("Game not found " + gameId);

        if(game.getPlayers().size() >= 4) {
            throw new IllegalStateException("Game is already full");
        }

        PlayerSetting humanSetting = getPlayerSetting(email);
        String requestedColor = humanSetting.getColor();

        List<String> allColors = List.of("red", "blue", "yellow", "green");

        Set<String> usedColors = game.getPlayers()
                .stream()
                .map(Player::getColor)
                .collect(Collectors.toSet());

        String assignedColor = requestedColor;
        if(usedColors.contains(requestedColor)) {
            assignedColor = allColors.stream()
                    .filter(c -> !usedColors.contains(c))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No colors available"));
        }

        Player player = createHuman(humanSetting.getName(), assignedColor);
        player.setStartOffset(getStartOffset(assignedColor));

        game.getPlayers().add(player);
        playerToGame.put(player.getPlayerId(), gameId);

        broadcastGameState(game);
        return game;
    }

    public List<Game> getWaitingGames() {
        return activeGames.values().stream()
                .filter(g -> !g.isStarted() && g.getPlayers().size() < 4)
                .toList();
    }

    private PlayerSetting getPlayerSetting(String email) {
        var optional = playerSettingRepository.findByEmail(email);
        if(optional.isEmpty()) throw new IllegalStateException("User not found with email: " + email);
        return optional.get();
    }

    public synchronized Game startNewGame(String email) {
        // Create a single player game with bots prefilled
        Game game = createMultiplayerGame(email);

        int totalPlayers = getPlayerSetting(email).getGameType().equalsIgnoreCase("twoPlayers") ? 2 : 4;
        startGameInternal(game, totalPlayers);

        return game;
    }

    private void startGameInternal(Game game, int totalPlayers) {
        // Build bots or complete player list to 2-4 depending on saved preference
        List<Player> players = new ArrayList<>(game.getPlayers());
        Player human = players.get(0);

        List<String> allColors = List.of("red", "blue", "yellow", "green");
        List<String> availableColors = new ArrayList<>(allColors);
        availableColors.remove(human.getColor());

        // If host saved gameType, we could use it; fallback to 2-player if only one human
        // For simplicity: if <2 players, add one bot; if 2 players already, optionally fill to 4 with bots
        if(totalPlayers == 2) {
            String botColor = getTwoPlayerBotColor(human.getColor());
            Player bot = createBot(botColor + " bot", botColor, getStartOffset(botColor));
            players.add(bot);

            playerToGame.put(bot.getPlayerId(), game.getGameId());
        } else {
            while(players.size() < totalPlayers) {
                String botColor = availableColors.remove(0);
                Player bot = createBot(botColor + " bot", botColor, getStartOffset(botColor));
                players.add(bot);
                playerToGame.put(bot.getPlayerId(), game.getGameId());
            }
        }

        game.setPlayers(players);
        game.startGame();
        game.setStarted(true);
        broadcastGameState(game);

        // If first player is bot, schedule its action
        Player first = getCurrentPlayer(game);
        if(first.isBot()) {
            scheduleBotTurn(game.getGameId(), first, 1000 + new Random().nextInt(1000));
        }
    }

    public synchronized void endGame(String gameId) {
        Game game = activeGames.remove(gameId);
        if(game != null) {
            for(Player p : game.getPlayers()) {
                playerToGame.remove(p.getPlayerId());
            }

            try {
                messagingTemplate.convertAndSend("/topic/game/" + gameId, Map.of("ended", true));
                System.out.println("🛑 Game ended and removed: " + gameId);
            } catch (Exception e) {
                messagingTemplate.convertAndSend("/topic/game/" + gameId, Map.of("ended", true));
                System.out.println("⚠️ Failed to broadcast endGame for " + gameId + ": " + e.getMessage());
            }
        }
    }

    /**
     * rolls the dice for the current player and moves to next turn
     *
     * @return the value of the rolled dice
     */
    public synchronized int rollDice(String playerId) {
        String gameId = playerToGame.get(playerId);
        if(gameId == null) throw new IllegalStateException("Player not in a game");
        Game game = activeGames.get(gameId);
        if(game == null) throw new IllegalStateException("Game not found for player");

        if(game.isPaused()) {
            throw new IllegalStateException("⚠️ Game is currently paused!");
        }

        Player current = getCurrentPlayer(game);
        // Ensures only current player can roll
        if (!current.getPlayerId().equals(playerId)) {
            throw new IllegalStateException("❌ It's not your turn!");
        }

        // Ensure they haven't already rolled this turn
        if (game.isDiceRolledThisTurn()) {
            throw new IllegalStateException("⚠️ You've already rolled the dice this turn!");
        }

        if(!game.isStarted()) {
            game.setStarted(true);
            System.out.println("🎮 Game started by host rolling dice: " + game.getGameId());
        }

        int value = game.rollDiceForPlayer(current);
        game.setLastRollValue(value);
        game.setDiceRolledThisTurn(true);

        System.out.println("🎲 " + current.getName() + " rolled a " + value + " in game " + gameId);

        broadcastGameState(game);

        // Check if any token can move right now
        var movableTokens = current.getTokens().stream()
                .filter(t -> t.canMove(value))
                .toList();

        if (movableTokens.isEmpty()) {
            System.out.println("⚠️ No possible moves for " + current.getName() + " with roll " + value);
            if (value != 6) {
                nextTurn(game);
            } else {
                System.out.println("🎁 " + current.getName() + " rolled 6 but can’t move — still gets another turn!");
                if (current.isBot()) {
                    scheduleBotTurn(gameId, current, 1000 + new Random().nextInt(1000));
                }
            }
            game.setLastRollValue(0);
            game.setDiceRolledThisTurn(false);
            broadcastGameState(game);
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
    public synchronized void moveToken(String playerId, String tokenId, int steps) {
        String gameId = playerToGame.get(playerId);
        if(gameId == null) throw new IllegalStateException("Player not in a game");
        Game game = activeGames.get(gameId);
        if(game == null) throw new IllegalStateException("Game not found for player");
        if(game.isPaused()) {
            throw new IllegalStateException("⚠️ Game is currently paused!");
        }

        Player current = getCurrentPlayer(game);
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
                    scheduleBotTurn(gameId, current, 1000 + new Random().nextInt(1000));
                }
            } else {
                nextTurn(game);
            }
            game.setLastRollValue(0);
            broadcastGameState(game);
            return;
        }

        // Auto-select if only one movable token
        if (!token.canMove(steps)) {
            token = movableTokens.get(0);
        }

        // Perform the single token movement (only once)
        game.moveToken(playerId, token.getTokenId(), steps);

        // Capture Logic
        int newPos = token.getAbsolutePosition(current.getStartOffset());

        // Only check captures if not in a safe zone
        if (!SAFE_CELLS.contains(newPos)) {
            for (Player p : game.getPlayers()) {
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
        for (Player p : game.getPlayers()) {
            p.getTokens().forEach(t -> System.out.println(p.getColor() + " token " + t.getTokenId() + " -> " + t.getPosition()));
        }

        // Check if player finished all tokens
        Player winner = game.checkWinner();
        if (winner != null) {
            System.out.println("🏆 " + winner.getName() + " has finished all their tokens!");

            long unfinishedPlayers = game.getPlayers().stream()
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
        if (game.getLastRollValue() == 6) {
            System.out.println("🎁 " + current.getName() + " rolled a 6 and gets another turn!");
            // If it's a bot, trigger its turn automatically after a delay
            if (current.isBot()) {
                scheduleBotTurn(gameId, current, 1000 + new Random().nextInt(1000));
//                new Timer().schedule(new TimerTask() {
//                    @Override
//                    public void run() {
//                        synchronized (GameService.this) {
//                            // Double check to ensure it's still this bot's turn
//                            if (getCurrentPlayer().getPlayerId().equals(current.getPlayerId())) {
//                                handleBotTurn(current);
//                            }
//                        }
//                    }
//                }, 1000 + new Random().nextInt(1000));
            }
        } else {
            nextTurn(game);
        }

        // Clear last rolled value to avoid accidental reuse
        game.setLastRollValue(0);
        game.setDiceRolledThisTurn(false);
        broadcastGameState(game);
    }

    /**
     * checks if there is a winner
     *
     * @return the winner
     */
    public Player checkWinnerByGameId(String gameId) {
        Game game = activeGames.get(gameId);
        return game == null ? null : game.checkWinner();
    }

    /**
     * Moves to the next player's turn
     */
    public synchronized void nextTurn(Game game) {
        if (game == null || game.getPlayers() == null || game.getPlayers().isEmpty()) return;

        int totalPlayers = game.getPlayers().size();
        int next = (game.getCurrentTurn() + 1) % totalPlayers;

        // Skip players who finished all tokens
        int safety = 0;
        while (game.getPlayers().get(next).getTokens().stream().allMatch(t -> t.isFinished()) && safety < totalPlayers) {
            next = (next + 1) % totalPlayers;
            safety++;
        }

        game.setCurrentTurn(next);
        game.setDiceRolledThisTurn(false);
        game.setLastRollValue(0);

        Player nextPlayer = getCurrentPlayer(game);
        System.out.println("➡️ Next turn: " + nextPlayer.getName() + " (game " + game.getGameId() + ")");

        broadcastGameState(game);

        if (nextPlayer.isBot()) {
            scheduleBotTurn(game.getGameId(), nextPlayer, 1000 + new Random().nextInt(1000));
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

    private Player createHuman(String humanName, String humanColor) {
        Player human = new Player();
        human.setPlayerId(UUID.randomUUID().toString());
        human.setName(humanName != null ? humanName : humanColor +  " player");
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

    private void scheduleBotTurn(String gameId, Player bot, long delayMs) {
        scheduler.schedule(() -> {
            synchronized (GameService.this) {
                Game game = activeGames.get(gameId);
                if(game == null) return;
                Player current = getCurrentPlayer(game);
                if(!current.getPlayerId().equals(bot.getPlayerId())) return;
                if(game.isDiceRolledThisTurn()) return;
                handleBotTurn(game, bot);
            }
        }, delayMs, TimeUnit.MILLISECONDS);
    }

    /**
     * Simple bot logic: auto roll and auto move
     */
    private void handleBotTurn(Game game, Player bot) {
        if(game.isPaused()) return;
        try {
            System.out.println("🤖 " + bot.getName() + " is thinking... (game " + game.getGameId() + ")");
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
            game.setDiceRolledThisTurn(false);
        }
    }

    private void broadcastGameState(Game game) {
        try {
            messagingTemplate.convertAndSend("/topic/game/" + game.getGameId(), game);
        } catch (Exception e) {
            System.out.println("Failed to broadcast game state: " + e.getMessage());
        }
    }

    private Player getCurrentPlayer(Game game) {
        return game.getPlayers().get(game.getCurrentTurn());
    }

    public Game getGameById(String gameId) {
        return activeGames.get(gameId);
    }

    public Game getGameForPlayer(String playerId) {
        String gameId = playerToGame.get(playerId);
        return gameId == null ? null : activeGames.get(gameId);
    }

//    public synchronized boolean isPaused() {
//        return paused;
//    }
    public synchronized void setPaused(String gameId, boolean pause) {
        Game game = activeGames.get(gameId);
        if(game == null) return;
        game.setPaused(pause);
        broadcastGameState(game);
        System.out.println(pause ? "⏸️ Game paused" : "▶️ Game resumed");

        if(!pause) {
            // Resume logic: check if it's bot turn
            Player current = getCurrentPlayer(game);
            if(current != null && current.isBot()) {
                System.out.println("🤖 Resuming bot turn for " + current.getName());
                scheduleBotTurn(gameId, current, 1000 + new Random().nextInt(1000));
            }
        }
    }
}