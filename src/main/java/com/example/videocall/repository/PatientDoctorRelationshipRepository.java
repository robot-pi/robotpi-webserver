package com.example.videocall.repository;

import com.example.videocall.model.PatientDoctorRelationship;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientDoctorRelationshipRepository extends JpaRepository<PatientDoctorRelationship, Long> {
}