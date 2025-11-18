package com.ludo.server.controller;

import com.ludo.server.model.PlayerSetting;
import com.ludo.server.service.PlayerSettingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/settings")
@CrossOrigin(origins = "https://ludo-ray.vercel.app/")
public class PlayerSettingController {

    private final PlayerSettingService playerSettingService;

    public PlayerSettingController(PlayerSettingService playerSettingService) {
        this.playerSettingService = playerSettingService;
    }

    @PostMapping("/save")
    public PlayerSetting saveSetting(@RequestBody PlayerSetting setting) {
        System.out.println("📩 Saving setting for: " + setting.getEmail());
        return playerSettingService.saveOrUpdate(setting);
    }

    @GetMapping("/by-email")
    public PlayerSetting getByEmail(@RequestParam String email) {
        return playerSettingService.getByEmail(email);
    }

    @GetMapping("/all")
    public List<PlayerSetting> getAllSettings() {
        return playerSettingService.getAllSettings();
    }
}
