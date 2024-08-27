package com.example.videocall.repository;

import com.example.videocall.model.RobotPatientRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RobotPatientRelationshipRepository extends JpaRepository<RobotPatientRelationship, Long> {
}
