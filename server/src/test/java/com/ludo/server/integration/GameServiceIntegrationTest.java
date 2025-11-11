package com.ludo.server.integration;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import com.ludo.server.service.GameService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for GameService and its interaction with Game, Player, and Token.
 */
@SpringBootTest
public class GameServiceIntegrationTest {

    @Autowired
    private GameService gameService;

    @Test
    void testStartNewGameAndRollDice() {
        // Start a new game
        Game game = gameService.startNewGame("Tester");
        assertNotNull(game, "Game should be initialized");
        assertEquals(4, game.getPlayers().size(), "There should be 4 players in the game");

        // Verify current player
        Player currentPlayer = game.getPlayers().get(game.getCurrentTurn());
        assertNotNull(currentPlayer, "There should be a current player");

        // Roll dice for current player
        int roll = gameService.rollDice(currentPlayer.getPlayerId());
        assertTrue(roll >= 1 && roll <= 6, "Dice roll should be between 1 and 6");

        // Check if game state updated properly
        assertTrue(gameService.getCurrentGame().getPlayers().contains(currentPlayer),
                "Current player should still be in the game");

        // Move a token if possible
        var movableTokens = currentPlayer.getTokens().stream()
                .filter(t -> t.canMove(roll))
                .toList();

        if (!movableTokens.isEmpty()) {
            var token = movableTokens.get(0);
            int previousPosition = token.getPosition();

            gameService.moveToken(currentPlayer.getPlayerId(), token.getTokenId(), roll);

            assertNotEquals(previousPosition, token.getPosition(),
                    "Token position should change after move");
        }
    }
}
