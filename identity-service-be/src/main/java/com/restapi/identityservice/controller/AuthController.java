package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.AuthRequest;
import com.restapi.identityservice.dto.response.AuthResponse;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.UserRepository;
import com.restapi.identityservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest authRequest) throws Exception {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (Exception e) {
            throw new Exception("Invalid username or password");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new Exception("User not found"));
                
        String plan = user.getCurrentPlan() != null ? user.getCurrentPlan() : "FREE";
        
        if (user.getParentSalonId() != null) {
            User parentSalon = userRepository.findById(user.getParentSalonId()).orElse(null);
            if (parentSalon != null && parentSalon.getCurrentPlan() != null) {
                plan = parentSalon.getCurrentPlan();
            } else {
                plan = "PREMIUM";
            }
        }
                
        String jwt = jwtUtil.generateToken(userDetails, plan);
        
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return new AuthResponse(jwt, role, plan);
    }

    @PostMapping("/debug-login")
    public String debugLogin(@RequestBody AuthRequest authRequest) {
        try {
            User user = userRepository.findByUsername(authRequest.getUsername())
                    .orElseThrow(() -> new Exception("User not found in DB"));
            
            boolean matches = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                    .matches(authRequest.getPassword(), user.getPassword());
                    
            return "Username: " + user.getUsername() + 
                   "\nDB Encoded Password: " + user.getPassword() +
                   "\nInput Raw Password: '" + authRequest.getPassword() + "'" +
                   "\nMatches: " + matches;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
