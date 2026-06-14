package com.restapi.identityservice.controller;

import com.restapi.identityservice.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Allow React frontend to call
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.getOrDefault("message", "");
        if (userMessage.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("reply", "Tin nhắn không được để trống."));
        }
        
        String aiResponse = chatbotService.askQuestion(userMessage);
        return ResponseEntity.ok(Map.of("reply", aiResponse));
    }
}
