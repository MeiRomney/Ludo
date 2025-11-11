package com.ludo.server.service;

import com.ludo.server.model.PlayerSetting;
import com.ludo.server.repository.PlayerSettingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerSettingService {
    private final PlayerSettingRepository repo;

    public PlayerSettingService(PlayerSettingRepository repo) {
        this.repo = repo;
    }

    public PlayerSetting saveOrUpdate(PlayerSetting setting) {
        return repo.findByEmail(setting.getEmail())
                .map(existing -> {
                    existing.setName(setting.getName());
                    existing.setColor(setting.getColor());
                    existing.setGameType(setting.getGameType());
                    existing.setClerkId(setting.getClerkId());
                    return repo.save(existing);
                })
                .orElseGet(() -> repo.save(setting));
    }

    public PlayerSetting getByEmail(String email) {
        return repo.findByEmail(email).orElse(null);
    }

    public List<PlayerSetting> getAllSettings() {
        return repo.findAll();
    }
}
