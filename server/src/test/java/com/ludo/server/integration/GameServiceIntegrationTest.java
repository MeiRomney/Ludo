package com.ludo.server.integration;

import com.ludo.server.model.Game;
import com.ludo.server.model.Player;
import com.ludo.server.model.PlayerSetting;
import com.ludo.server.repository.PlayerSettingRepository;
import com.ludo.server.service.GameService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class GameServiceIntegrationTest {

    private GameService gameService;
    private PlayerSettingRepository playerSettingRepository;
    private SimpMessagingTemplate messagingTemplate;

    @BeforeEach
    void setup() {
        playerSettingRepository = Mockito.mock(PlayerSettingRepository.class);
        messagingTemplate = Mockito.mock(SimpMessagingTemplate.class);

        PlayerSetting setting = new PlayerSetting();
        setting.setEmail("tester@example.com");
        setting.setName("IntegrationTester");
        setting.setColor("red");
        setting.setGameType("fourPlayers");

        Mockito.when(playerSettingRepository.findByEmail("tester@example.com"))
                .thenReturn(Optional.of(setting));

        gameService = new GameService(playerSettingRepository, messagingTemplate);
    }

    @Test
    void testStartGameAndRollDice_HumanOnly() {
        // Create a game manually without bots
        Game game = gameService.createMultiplayerGame("tester@example.com");
        game.startGame();  // mark as started

        assertNotNull(game);
        assertEquals(1, game.getPlayers().size());  // only human player

        Player current = game.getPlayers().get(game.getCurrentTurn());
        int roll = gameService.rollDice(current.getPlayerId());
        assertTrue(roll >= 1 && roll <= 6);

        var movableTokens = current.getTokens().stream().filter(t -> t.canMove(roll)).toList();
        if (!movableTokens.isEmpty()) {
            var token = movableTokens.get(0);
            int prevPos = token.getPosition();
            gameService.moveToken(current.getPlayerId(), token.getTokenId(), roll);
            assertNotEquals(prevPos, token.getPosition());
        }
    }

}
