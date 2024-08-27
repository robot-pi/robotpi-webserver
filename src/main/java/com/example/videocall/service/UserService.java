package com.example.videocall.service;

import com.example.videocall.model.ActiveUserInfo;
import com.example.videocall.model.User;
import com.example.videocall.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User saveUsers(User user) {
        return userRepository.save(user);
    }

    public User setAvailableAndSave(User user) {
        user.setAvailabilityStatus("available");
        return saveUsers(user);
    }

    public Optional<User> getFirstDoc() {
        return userRepository.findByUsername("doctor1");
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public ActiveUserInfo transformUser(User user) {
        return ActiveUserInfo.builder()
                .id(user.getId())
                .availabilityStatus(user.getAvailabilityStatus())
                .username(user.getUsername())
                .build();
    }

    public List<ActiveUserInfo> transformUsers(List<User> users) {
        if (users == null) {
            return null;
        }
        return users.stream().map(user -> transformUser(user)).collect(Collectors.toList());
    }
}
