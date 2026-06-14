package com.restapi.identityservice.dto.response;

import com.restapi.identityservice.entity.Address;

public class AddressResponse {
    private String id;
    private String recipientName;
    private String phoneNumber;
    private String detailedAddress;
    private boolean isDefault;

    public AddressResponse(Address address) {
        this.id = address.getId();
        this.recipientName = address.getRecipientName();
        this.phoneNumber = address.getPhoneNumber();
        this.detailedAddress = address.getDetailedAddress();
        this.isDefault = address.isDefault();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDetailedAddress() { return detailedAddress; }
    public void setDetailedAddress(String detailedAddress) { this.detailedAddress = detailedAddress; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
}
