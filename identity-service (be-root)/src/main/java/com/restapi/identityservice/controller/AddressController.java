package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.request.AddressRequest;
import com.restapi.identityservice.dto.response.AddressResponse;
import com.restapi.identityservice.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/me/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public List<AddressResponse> getMyAddresses() {
        return addressService.getAddressesByUsername(getCurrentUsername());
    }

    @PostMapping
    public AddressResponse addAddress(@RequestBody AddressRequest request) {
        return addressService.addAddress(getCurrentUsername(), request);
    }

    @PutMapping("/{id}")
    public AddressResponse updateAddress(@PathVariable String id, @RequestBody AddressRequest request) {
        return addressService.updateAddress(getCurrentUsername(), id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable String id) {
        addressService.deleteAddress(getCurrentUsername(), id);
    }

    @PutMapping("/{id}/default")
    public AddressResponse setDefaultAddress(@PathVariable String id) {
        return addressService.setDefaultAddress(getCurrentUsername(), id);
    }
}
