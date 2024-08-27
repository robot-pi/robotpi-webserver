package com.example.videocall.repository;

import com.example.videocall.model.PatientBioStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientBioStatusRepository extends JpaRepository<PatientBioStatus, Long> {
}