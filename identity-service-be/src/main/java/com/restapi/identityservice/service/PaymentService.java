package com.restapi.identityservice.service;

import com.restapi.identityservice.config.VNPayConfig;
import com.restapi.identityservice.dto.PaymentDTO;
import com.restapi.identityservice.dto.response.PaymentResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.url}")
    private String vnp_Url;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    public PaymentResponseDTO createPayment(PaymentDTO paymentDTO, String ipAddress) {
        long amount = paymentDTO.getAmount() * 100;
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode.trim());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB"); // For testing
        // orderInfo format: "username_BUY_PLANCODE" — used to identify user on callback
        String orderInfo = (paymentDTO.getOrderInfo() != null && !paymentDTO.getOrderInfo().isBlank())
                ? paymentDTO.getOrderInfo()
                : "user_BUY_PRO";
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                try {
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());
                    if (hashData.length() > 0) {
                        hashData.append('&');
                        query.append('&');
                    }
                    hashData.append(fieldName).append('=').append(encodedValue);
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=').append(encodedValue);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnp_HashSecret.trim(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_Url + "?" + queryUrl;

        return new PaymentResponseDTO("OK", "Successfully created payment URL", paymentUrl);
    }
}
