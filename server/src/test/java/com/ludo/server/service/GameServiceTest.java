package com.ludo.server.service;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import com.ludo.server.model.PlayerSetting;
import com.ludo.server.repository.PlayerSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class GameServiceTest {

    private GameService gameService;
    private PlayerSettingRepository playerSettingRepository;

    @BeforeEach
    void setUp() {
        // Mock the repository
        playerSettingRepository = Mockito.mock(PlayerSettingRepository.class);

        // Provide a fake PlayerSetting for any email
        PlayerSetting fakeSetting = new PlayerSetting();
        fakeSetting.setEmail("Tester");
        fakeSetting.setName("TestPlayer");
        fakeSetting.setColor("red");
        fakeSetting.setGameType("fourPlayers");

        Mockito.when(playerSettingRepository.findByEmail("Tester"))
                .thenReturn(Optional.of(fakeSetting));

        gameService = new GameService(playerSettingRepository);
    }

    @Test
    void startNewGame_ShouldInitializeGameWithFourPlayers() {
        Game game = gameService.startNewGame("Tester");

        assertNotNull(game, "Game should not be null after starting a new game.");
        assertNotNull(game.getPlayers(), "Players list should not be null.");
        assertEquals(4, game.getPlayers().size(), "Game should have exactly 4 players.");

        // Verify player colors
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("red")));
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("blue")));
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("yellow")));
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("green")));

        // Check current turn initialization
        assertTrue(game.getCurrentTurn() >= 0, "Current turn should be initialized.");
    }

    @Test
    void rollDice_ShouldReturnValueBetween1And6_WhenGameStarted() {
        Game game = gameService.startNewGame("Tester");
        Player current = game.getPlayers().get(game.getCurrentTurn());
        int value = gameService.rollDice(current.getPlayerId());

        assertTrue(value >= 1 && value <= 6, "Dice value should be between 1 and 6.");
    }

    @Test
    void checkWinner_ShouldReturnNull_WhenNoWinnerYet() {
        gameService.startNewGame("Tester");
        Player winner = gameService.checkWinner();
        assertNull(winner, "No winner should be present at the start of the game.");
    }

    @Test
    void nextTurn_ShouldAdvanceTurnToNextPlayer() {
        gameService.startNewGame("Tester");
        Game game = gameService.getCurrentGame();
        int initialTurn = game.getCurrentTurn();

        gameService.nextTurn();
        int nextTurn = game.getCurrentTurn();

        assertEquals((initialTurn + 1) % 4, nextTurn, "Next turn should rotate to next player.");
    }

    @Test
    void moveToken_ShouldAdvanceTurnAfterMove() {
        gameService.startNewGame("Tester");
        Game game = gameService.getCurrentGame();

        Player currentPlayer = game.getPlayers().get(game.getCurrentTurn());
        String playerId = currentPlayer.getPlayerId();
        String tokenId = currentPlayer.getTokens().get(0).getTokenId();

        int initialTurn = game.getCurrentTurn();

        gameService.moveToken(playerId, tokenId, 4);
        int nextTurn = game.getCurrentTurn();

        // If moveToken allows rolling again on 6, nextTurn may not change. For deterministic test, assume steps < 6
        assertEquals((initialTurn + 1) % 4, nextTurn, "Turn should move to the next player after token move.");
    }

    @Test
    void getCurrentGame_ShouldReturnSameInstanceAfterStart() {
        Game startedGame = gameService.startNewGame("Tester");
        Game retrievedGame = gameService.getCurrentGame();

        assertSame(startedGame, retrievedGame, "getCurrentGame() should return the same game instance.");
    }
}
