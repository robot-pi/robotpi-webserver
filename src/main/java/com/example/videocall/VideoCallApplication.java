
package com.example.videocall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
//@EnableMongoRepositories
public class VideoCallApplication {
    public static void main(String[] args) {
        SpringApplication.run(VideoCallApplication.class, args);
    }
}
