package com.restapi.identityservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendMemberCredentials(String to, String firstName, String username, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("nailform3d.system@gmail.com"); // Usually overridden by the real Gmail account
            message.setTo(to);
            message.setSubject("Welcome to NAILFORM 3D - Your Studio Account");
            message.setText("Hello " + firstName + ",\n\n" +
                    "Your salon admin has created a 3D Nail Design account for you.\n" +
                    "You can now log in and access your personal design space sharing Premium benefits.\n\n" +
                    "Username: " + username + "\n" +
                    "Password: " + password + "\n\n" +
                    "Please log in and change your password as soon as possible.\n\n" +
                    "Best regards,\nNAILFORM 3D Team");
            
            mailSender.send(message);
            System.out.println("Real Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send real email. Error: " + e.getMessage());
            System.err.println("Note: Please configure your real Gmail and App Password in application.yaml to enable email sending.");
        }
    }
}
