package com.example.videocall.model;


import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "patient_bio_status")
public class PatientBioStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "oxygen_level")
    private Double oxygenLevel;

    // Getters and setters
}
