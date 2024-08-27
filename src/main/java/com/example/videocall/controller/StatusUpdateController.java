package com.example.videocall.controller;

import com.example.videocall.model.StatusUpdate;
import com.example.videocall.repository.StatusUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/status")
public class StatusUpdateController {

    @Autowired
    private StatusUpdateRepository statusUpdateRepository;

    @PostMapping("/upload")
    public StatusUpdate uploadStatus(@RequestBody StatusUpdate statusUpdate) {
        statusUpdate.setTimestamp(LocalDateTime.now());
        return statusUpdateRepository.save(statusUpdate);
    }

    @GetMapping("/history/{clientId}")
    public List<StatusUpdate> getStatusHistory(@PathVariable String clientId) {
        return statusUpdateRepository.findByClientId(clientId);
    }
}
