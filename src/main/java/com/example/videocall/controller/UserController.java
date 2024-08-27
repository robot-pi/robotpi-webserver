package com.example.videocall.controller;

import com.example.videocall.model.ActiveUserInfo;
import com.example.videocall.model.UserLoginRequest;
import com.example.videocall.model.User;
import com.example.videocall.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/api/users/login")
    public ActiveUserInfo loginUser(@RequestBody UserLoginRequest request) {
        Optional<User> optionalUser = userService.getUserByUsername(request.getUsername());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getPassword().equals(request.getPassword())) {
                return userService.transformUser(userService.setAvailableAndSave(user));
            } else {
                throw new RuntimeException("Invalid password");
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }

    @GetMapping("/api/users/doctors")
    public ActiveUserInfo getDefaultDoctor() {
        return userService.transformUser(userService.getFirstDoc().get());
    }

    @GetMapping("/api/users/patients")
    public ActiveUserInfo getAllPatients() {
        return userService.transformUser(userService.getFirstDoc().get());
    }

    @GetMapping("/api/users/role/{role}")
    public List<ActiveUserInfo> getUsersByRole(@PathVariable String role) {
        return userService.transformUsers(userService.getUsersByRole(role));
    }
}
