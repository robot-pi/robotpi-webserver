package com.example.videocall.repository;

import com.example.videocall.model.StatusUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StatusUpdateRepository extends MongoRepository<StatusUpdate, String> {
    List<StatusUpdate> findByClientId(String clientId);
}
