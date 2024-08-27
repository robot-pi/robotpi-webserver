package com.example.videocall.service;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Service
public class VideoStreamService {

    public byte[] getVideoStream() throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder("raspivid", "-t", "0", "-o", "-", "-w", "640", "-h", "480", "-fps", "25");
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        try (InputStream is = process.getInputStream();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            byte[] buffer = new byte[1024];
            int length;
            while ((length = is.read(buffer)) != -1) {
                baos.write(buffer, 0, length);
            }

            return baos.toByteArray();
        }
    }
}
