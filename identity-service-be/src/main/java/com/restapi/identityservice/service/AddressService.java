package com.restapi.identityservice.service;

import com.restapi.identityservice.dto.request.AddressRequest;
import com.restapi.identityservice.dto.response.AddressResponse;
import com.restapi.identityservice.entity.Address;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserService userService;

    public List<AddressResponse> getAddressesByUsername(String username) {
        User user = userService.getUserMe(username);
        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(AddressResponse::new)
                .collect(Collectors.toList());
    }

    public AddressResponse addAddress(String username, AddressRequest request) {
        User user = userService.getUserMe(username);
        
        // If this is the first address or set as default, handle defaults
        List<Address> existing = addressRepository.findByUserId(user.getId());
        boolean isFirst = existing.isEmpty();
        
        if (request.isDefault() || isFirst) {
            clearDefaults(user.getId());
        }

        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setDetailedAddress(request.getDetailedAddress());
        address.setDefault(request.isDefault() || isFirst);

        return new AddressResponse(addressRepository.save(address));
    }

    public AddressResponse updateAddress(String username, String addressId, AddressRequest request) {
        User user = userService.getUserMe(username);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your address");
        }

        if (request.isDefault() && !address.isDefault()) {
            clearDefaults(user.getId());
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setDetailedAddress(request.getDetailedAddress());
        // Do not allow unsetting the only default address easily, but for now just take the request value
        if (request.isDefault()) {
            address.setDefault(true);
        }

        return new AddressResponse(addressRepository.save(address));
    }

    public void deleteAddress(String username, String addressId) {
        User user = userService.getUserMe(username);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your address");
        }

        addressRepository.delete(address);
        
        // If we deleted the default, set another one as default if exists
        if (address.isDefault()) {
            List<Address> remaining = addressRepository.findByUserId(user.getId());
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    public AddressResponse setDefaultAddress(String username, String addressId) {
        User user = userService.getUserMe(username);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your address");
        }

        clearDefaults(user.getId());
        
        address.setDefault(true);
        return new AddressResponse(addressRepository.save(address));
    }

    private void clearDefaults(String userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
