package com.example.videocall.model;

import javax.persistence.*;

@Entity
@Table(name = "robots")
public class Robot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "robot_name", nullable = false, unique = true)
    private String robotName;

    @Column(nullable = false)
    private String status;

    // Getters and setters
}
