package com.restapi.identityservice.dto.request;

public class AddressRequest {
    private String recipientName;
    private String phoneNumber;
    private String detailedAddress;
    private boolean isDefault;

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDetailedAddress() { return detailedAddress; }
    public void setDetailedAddress(String detailedAddress) { this.detailedAddress = detailedAddress; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
}
