package com.ludo.server.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;
    private String gameType;
    private String email;
    private String clerkId;
}
