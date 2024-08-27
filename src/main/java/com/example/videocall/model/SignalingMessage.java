package com.example.videocall.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SignalingMessage {

    private String type;
    private String source;
    private String target;
    private String sdp;
    private IceCandidate candidate;

    // Getters and Setters

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getSdp() {
        return sdp;
    }

    public void setSdp(String sdp) {
        this.sdp = sdp;
    }

    public IceCandidate getCandidate() {
        return candidate;
    }

    public void setCandidate(IceCandidate candidate) {
        this.candidate = candidate;
    }

    public static class IceCandidate {
        private String candidate;
        private String sdpMid;
        private Integer sdpMLineIndex;
        private String usernameFragment;

        // Getters and Setters

        public String getCandidate() {
            return candidate;
        }

        public void setCandidate(String candidate) {
            this.candidate = candidate;
        }

        public String getSdpMid() {
            return sdpMid;
        }

        public void setSdpMid(String sdpMid) {
            this.sdpMid = sdpMid;
        }

        public Integer getSdpMLineIndex() {
            return sdpMLineIndex;
        }

        public void setSdpMLineIndex(Integer sdpMLineIndex) {
            this.sdpMLineIndex = sdpMLineIndex;
        }

        public String getUsernameFragment() {
            return usernameFragment;
        }

        public void setUsernameFragment(String usernameFragment) {
            this.usernameFragment = usernameFragment;
        }
    }
}
