package com.example.videocall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.videocall.service.VideoStreamService;

@RestController
public class VideoMonitorController {

    @Autowired
    private VideoStreamService videoStreamService;

    @GetMapping(value = "/stream", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public byte[] streamVideo() throws Exception {
        return videoStreamService.getVideoStream();
    }
}
