package com.ludo.server.controller;

import com.ludo.server.model.*;
import com.ludo.server.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/game")
@CrossOrigin(origins = "https://ludo-ray-git-main-mei-romneys-projects.vercel.app/")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startGame(@RequestParam String email) {
        System.out.println("🎯 /api/game/start endpoint hit! email=" + email);
        try {
            Game game = gameService.startNewGame(email);

            // Find the human playerId
            String playerId = game.getPlayers().stream()
                    .filter(p -> !p.isBot())
                    .map(Player::getPlayerId)
                    .findFirst()
                    .orElse(null);

            return ResponseEntity.ok(Map.of("game", game, "playerId", playerId));
        } catch(IllegalStateException e) {
            e.printStackTrace();
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "details",  e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGame(@RequestParam String email) {
        try {
            Game game = gameService.createMultiplayerGame(email);
            return ResponseEntity.ok(Map.of("gameId", game.getGameId(), "game", game));
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGame(@RequestParam String email, @RequestParam String gameId) {
        try {
            Game game = gameService.joinExistingGame(email, gameId);
            // return full game so client can render
            return ResponseEntity.ok(Map.of("game", game));
        } catch(IllegalStateException e) {
            e.printStackTrace();
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/waiting")
    public ResponseEntity<?> getWaitingGames() {
        List<Map<String, String>> waitingGames = gameService.getWaitingGames().stream()
                .map(g -> Map.of(
                        "gameId", g.getGameId(),
                        "players", String.valueOf(g.getPlayers().size())
                ))
                .toList();
        return ResponseEntity.ok(waitingGames);
    }

    @PostMapping("/end")
    public ResponseEntity<Void> endGame(@RequestParam String gameId) {
        gameService.endGame(gameId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roll")
    public ResponseEntity<?> rollDice(@RequestParam String playerId) {
        try {
            int val = gameService.rollDice(playerId);
            return ResponseEntity.ok(Map.of("value", val));
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/move")
    public ResponseEntity<?> moveToken(@RequestParam String playerId,
                          @RequestParam String tokenId,
                          @RequestParam int steps) {
        try {
            gameService.moveToken(playerId, tokenId, steps);
            Game game = gameService.getGameForPlayer(playerId);
            return ResponseEntity.ok(Map.of("game", game));
        } catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/pause")
    public ResponseEntity<String> pauseGame(@RequestParam String gameId) {
        gameService.setPaused(gameId, true);
        return ResponseEntity.ok("Game paused");
    }

    @PostMapping("/resume")
    public ResponseEntity<String> resumeGame(@RequestParam String gameId) {
        gameService.setPaused(gameId, false);
        return ResponseEntity.ok("Game resumed");
    }

//    @GetMapping("/paused")
//    public ResponseEntity<Boolean> isPaused() {
//        return ResponseEntity.ok(gameService.isPaused());
//    }


    @GetMapping("/winner")
    public Player checkWinner(@RequestParam String gameId) {
        return gameService.checkWinnerByGameId(gameId);
    }

    @GetMapping("/state")
    public ResponseEntity<?> getState(@RequestParam String gameId) {
        Game game = gameService.getGameById(gameId);
        if(game == null) return ResponseEntity.status(404).body(Map.of("error", "Game not found"));
        return ResponseEntity.ok(game);
    }

    @GetMapping("/results")
    public Results getResults(@RequestParam String gameId) {
        Game game = gameService.getGameById(gameId);
        if(game == null) {
            return new Results(null, List.of());
        }

        gameService.checkWinnerByGameId(gameId);
        return gameService.buildResults(game);
    }
}