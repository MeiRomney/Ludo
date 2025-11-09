package com.ludo.server.controller;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import com.ludo.server.model.Results;
import com.ludo.server.model.Token;
import com.ludo.server.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/game")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/start")
    public Game startGame(@RequestParam(required = false) String playerName) {
        System.out.println("🎯 /api/game/start endpoint hit!");
        return gameService.startNewGame(playerName != null ? playerName : "You");
    }

    @PostMapping("/move")
    public Game moveToken(@RequestParam String playerId,
                          @RequestParam String tokenId,
                          @RequestParam int steps) {
        gameService.moveToken(playerId, tokenId, steps);
        return gameService.getCurrentGame();
    }

    @PostMapping("/pause")
    public ResponseEntity<String> pauseGame() {
        gameService.setPaused(true);
        return ResponseEntity.ok("Game paused");
    }

    @PostMapping("/resume")
    public ResponseEntity<String> resumeGame() {
        gameService.setPaused(false);
        return ResponseEntity.ok("Game resumed");
    }

    @GetMapping("/paused")
    public ResponseEntity<Boolean> isPaused() {
        return ResponseEntity.ok(gameService.isPaused());
    }

    @GetMapping("/roll")
    public int rollDice(@RequestParam String playerId) {
        return gameService.rollDice(playerId);
    }

    @GetMapping("/winner")
    public Player checkWinner() {
        return gameService.checkWinner();
    }

    @GetMapping("/state")
    public Game getCurrentGame() {
        return gameService.getCurrentGame();
    }

    @GetMapping("/results")
    public Results getResults() {
        Game current = gameService.getCurrentGame();
        if(current == null) {
            return new Results(null, List.of());
        }

        gameService.checkWinner();
        return gameService.buildResults(current);
    }
}