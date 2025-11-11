package com.ludo.server.repository;

import com.ludo.server.model.PlayerSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerSettingRepository extends JpaRepository<PlayerSetting, Long> {
    Optional<PlayerSetting> findByEmail(String email);
//    Optional<PlayerSetting> findByColor(String color);
}
