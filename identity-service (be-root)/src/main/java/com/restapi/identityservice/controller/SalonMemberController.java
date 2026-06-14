package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.SalonMemberCreationRequest;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.service.SalonMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salon/members")
public class SalonMemberController {

    @Autowired
    private SalonMemberService salonMemberService;

    @GetMapping
    public List<User> getMembers() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return salonMemberService.getMembers(username);
    }

    @PostMapping
    public User addMember(@RequestBody SalonMemberCreationRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return salonMemberService.addMember(username, request);
    }

    @DeleteMapping("/{id}")
    public void removeMember(@PathVariable String id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        salonMemberService.removeMember(username, id);
    }

    @PutMapping("/{id}")
    public User updateMember(@PathVariable String id, @RequestBody com.restapi.identityservice.dto.request.SalonMemberUpdateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return salonMemberService.updateMember(username, id, request);
    }
}
