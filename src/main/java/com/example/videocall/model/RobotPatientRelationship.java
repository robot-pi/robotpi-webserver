package com.example.videocall.model;

import javax.persistence.*;

@Entity
@Table(name = "robot_patient_relationship")
public class RobotPatientRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "robot_id", nullable = false)
    private Long robotId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String status;

    // Getters and setters
}
