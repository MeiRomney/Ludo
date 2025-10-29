package com.ludo.server.controller;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import com.ludo.server.service.GameService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/game")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/start")
    public Game startGame() {
        return gameService.startNewGame();
    }

    @PostMapping("/move")
    public void moveToken(@RequestParam String playerId,
                          @RequestParam String tokenId,
                          @RequestParam int steps) {
        gameService.moveToken(playerId, tokenId, steps);
    }

    @GetMapping("/roll")
    public int rollDice() {
        return gameService.rollDice();
    }

    @GetMapping("/winner")
    public Player checkWinner() {
        return gameService.checkWinner();
    }
}