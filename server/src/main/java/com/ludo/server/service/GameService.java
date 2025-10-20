package com.ludo.server.service;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    private Game game;

    public Game startNewGame() {
        game = new Game();
        game.startGame();
        return game;
    }

    public int rollDice() {
        return game.rollDice();
    }

    public Player checkWinner() {
        return game.checkWinner();
    }
}