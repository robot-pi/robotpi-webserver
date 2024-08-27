package com.example.videocall.service;

import com.example.videocall.model.SignalingMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SignalingService extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Handle connection established
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        SignalingMessage signalingMessage = parseMessage(message.getPayload());
        if (signalingMessage != null) {
            switch (signalingMessage.getType()) {
                case "register":
                    handleRegister(session, signalingMessage);
                    break;
                case "call":
                    handleCall(signalingMessage);
                    break;
                case "offer":
                    handleOffer(signalingMessage);
                    break;
                case "answer":
                    handleAnswer(signalingMessage);
                    break;
                case "candidate":
                    handleCandidate(signalingMessage);
                    break;
                case "call_reject":
                    handleCallReject(signalingMessage);
                    break;
                case "call_end":
                    handleCallEnd(signalingMessage);
                    break;
                default:
                    System.err.println("Unknown message type: " + signalingMessage.getType());
            }
        }
    }

    private SignalingMessage parseMessage(String payload) {
        try {
            return new ObjectMapper().readValue(payload, SignalingMessage.class);
        } catch (IOException e) {
            System.err.println("Error parsing signaling message: " + e.getMessage());
            return null;
        }
    }

    private void handleRegister(WebSocketSession session, SignalingMessage signalingMessage) {
        sessions.put(signalingMessage.getSource(), session);
        System.out.println("Registered client: " + signalingMessage.getSource());
    }

    private void handleCall(SignalingMessage signalingMessage) {
        sendToClient(signalingMessage.getTarget(), signalingMessage);
    }

    private void handleOffer(SignalingMessage signalingMessage) {
        sendToClient(signalingMessage.getTarget(), signalingMessage);
    }

    private void handleAnswer(SignalingMessage signalingMessage) {
        sendToClient(signalingMessage.getTarget(), signalingMessage);
    }

    private void handleCandidate(SignalingMessage signalingMessage) {
        sendToClient(signalingMessage.getTarget(), signalingMessage);
    }

    private void handleCallReject(SignalingMessage signalingMessage) {
        sendToClient(signalingMessage.getTarget(), signalingMessage);
    }

    private void handleCallEnd(SignalingMessage signalingMessage) {
        sendToClient(signalingMessage.getTarget(), signalingMessage);
    }

    private void sendToClient(String clientId, SignalingMessage signalingMessage) {
        WebSocketSession clientSession = sessions.get(clientId);
        if (clientSession != null) {
            try {
                clientSession.sendMessage(new TextMessage(new ObjectMapper().writeValueAsString(signalingMessage)));
            } catch (IOException e) {
                System.err.println("Error sending signaling message to client: " + e.getMessage());
            }
        } else {
            System.err.println("Target session not found or closed: " + clientId);
        }
    }
}
