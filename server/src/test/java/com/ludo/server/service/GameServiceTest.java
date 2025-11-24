package com.ludo.server.service;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import com.ludo.server.model.PlayerSetting;
import com.ludo.server.repository.PlayerSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class GameServiceTest {

    private GameService gameService;
    private PlayerSettingRepository playerSettingRepository;
    private SimpMessagingTemplate messagingTemplate;

    @BeforeEach
    void setUp() {
        // Mock repository and messaging template
        playerSettingRepository = Mockito.mock(PlayerSettingRepository.class);
        messagingTemplate = Mockito.mock(SimpMessagingTemplate.class);

        // Mock player setting
        PlayerSetting fakeSetting = new PlayerSetting();
        fakeSetting.setEmail("tester@example.com");
        fakeSetting.setName("TestPlayer");
        fakeSetting.setColor("red");
        fakeSetting.setGameType("fourPlayers");

        Mockito.when(playerSettingRepository.findByEmail("tester@example.com"))
                .thenReturn(Optional.of(fakeSetting));

        // Instantiate GameService
        gameService = new GameService(playerSettingRepository, messagingTemplate);
    }

    @Test
    void startNewGame_ShouldInitializeGameWithCorrectPlayers() {
        Game game = gameService.startNewGame("tester@example.com");

        assertNotNull(game);
        assertNotNull(game.getPlayers());
        assertEquals(4, game.getPlayers().size());

        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("red")));
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("blue")));
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("yellow")));
        assertTrue(game.getPlayers().stream().anyMatch(p -> p.getColor().equals("green")));
    }

    @Test
    void rollDice_ShouldReturnValueBetween1And6() {
        Game game = gameService.startNewGame("tester@example.com");
        Player current = gameService.getGameById(game.getGameId()).getPlayers().get(game.getCurrentTurn());

        int value = gameService.rollDice(current.getPlayerId());

        assertTrue(value >= 1 && value <= 6);
    }

    @Test
    void nextTurn_ShouldAdvanceCurrentTurn() {
        Game game = gameService.startNewGame("tester@example.com");
        int initialTurn = game.getCurrentTurn();

        gameService.nextTurn(game);

        int nextTurn = game.getCurrentTurn();
        assertNotEquals(initialTurn, nextTurn);
    }

    @Test
    void checkWinnerByGameId_ShouldReturnNull_WhenNoWinnerYet() {
        Game game = gameService.startNewGame("tester@example.com");
        assertNull(gameService.checkWinnerByGameId(game.getGameId()));
    }
}
