package com.example.videocall.controller;

import com.example.videocall.model.Client;
import com.example.videocall.model.UserLoginRequest;
import com.example.videocall.model.ClientStatusUpdateRequest;
import com.example.videocall.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping("/api/clients")
    public List<Client> getClients() {
        String excludeId = "666a713aafd17975d31e0fc4";
        return clientRepository.findAll().stream()
                .filter(client -> !client.getId().equals(excludeId))
                .collect(Collectors.toList());    }

    @GetMapping("/api/clients/host")
    public Client getHost() {
        // Assuming the host has a fixed ID, e.g., "host"
        return clientRepository.findById("666a713aafd17975d31e0fc4").orElse(null);
    }

    @PostMapping("/api/clients")
    public Client createClient(@RequestBody Client client) {
        client.setStatus("online");
        return clientRepository.save(client);
    }

    @PostMapping("/api/clients/status")
    public Client updateClientStatus(@RequestBody ClientStatusUpdateRequest request) {
        Optional<Client> optionalClient = clientRepository.findById(request.getClientId());
        if (optionalClient.isPresent()) {
            Client client = optionalClient.get();
            client.setStatus(request.getStatus());
            return clientRepository.save(client);
        } else {
            throw new RuntimeException("Client not found");
        }
    }

//    @PostMapping("/api/clients/login")
//    public Client loginClient(@RequestBody UserLoginRequest request) {
//        Optional<Client> optionalClient = clientRepository.findById(request.getClientId());
//        if (optionalClient.isPresent()) {
//            Client client = optionalClient.get();
//            if (client.getPassword().equals(request.getPassword())) {
//                return client;
//            } else {
//                throw new RuntimeException("Invalid password");
//            }
//        } else {
//            throw new RuntimeException("Client not found");
//        }
//    }
}
