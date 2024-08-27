package com.example.videocall.model;

import lombok.Data;
import lombok.Value;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clients")
//@Data
public class Client {

    @Id
    private String id;
    private String status;

    private String password;

    public Client() {
    }

    public Client(String id, String status) {
        this.id = id;
        this.status = status;
    }

    public Client(String id, String status, String password) {
        this.id = id;
        this.status = status;
        this.password = password;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}
