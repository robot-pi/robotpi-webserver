package com.example.videocall.model;


import javax.persistence.*;

@Entity
@Table(name = "patient_doctor_relationship")
public class PatientDoctorRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    // Getters and setters
}