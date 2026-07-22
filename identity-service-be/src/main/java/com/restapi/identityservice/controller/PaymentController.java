package com.restapi.identityservice.controller;

import com.restapi.identityservice.dto.PaymentDTO;
import com.restapi.identityservice.dto.response.PaymentResponseDTO;
import com.restapi.identityservice.entity.SubscriptionRequest;
import com.restapi.identityservice.entity.SubscriptionStatus;
import com.restapi.identityservice.entity.User;
import com.restapi.identityservice.repository.SubscriptionRequestRepository;
import com.restapi.identityservice.repository.UserRepository;
import com.restapi.identityservice.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private SubscriptionRequestRepository subscriptionRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create_payment")
    public PaymentResponseDTO createPayment(HttpServletRequest request, @RequestBody PaymentDTO paymentDTO) {
        String ipAddress = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        return paymentService.createPayment(paymentDTO, ipAddress);
    }

    @GetMapping("/vnpay_return")
    public PaymentResponseDTO verifyPayment(@RequestParam Map<String, String> allParams) {
        String vnp_ResponseCode = allParams.get("vnp_ResponseCode");
        String vnp_TxnRef = allParams.getOrDefault("vnp_TxnRef", "");
        String vnp_OrderInfo = allParams.getOrDefault("vnp_OrderInfo", "");
        String vnp_AmountStr = allParams.getOrDefault("vnp_Amount", "0");

        // Log for debugging
        System.out.println("=== VNPay Callback ===");
        System.out.println("ResponseCode: " + vnp_ResponseCode);
        System.out.println("TxnRef: " + vnp_TxnRef);
        System.out.println("OrderInfo: " + vnp_OrderInfo);
        System.out.println("Amount: " + vnp_AmountStr);

        if ("00".equals(vnp_ResponseCode)) {
            // Parse userId and plan from orderInfo: format "USERIDNOHYPHENS_BUY_PLANCODE"
            String planCode = "PRO";
            String userIdNoHyphens = "";

            if (vnp_OrderInfo != null && vnp_OrderInfo.contains("_BUY_")) {
                int buyIdx = vnp_OrderInfo.lastIndexOf("_BUY_");
                userIdNoHyphens = vnp_OrderInfo.substring(0, buyIdx);
                planCode = vnp_OrderInfo.substring(buyIdx + 5);
            }

            // Reconstruct UUID with hyphens: 8-4-4-4-12
            String userId = "";
            if (userIdNoHyphens.length() == 32) {
                userId = userIdNoHyphens.substring(0, 8) + "-"
                        + userIdNoHyphens.substring(8, 12) + "-"
                        + userIdNoHyphens.substring(12, 16) + "-"
                        + userIdNoHyphens.substring(16, 20) + "-"
                        + userIdNoHyphens.substring(20);
            }

            System.out.println("Parsed userId: " + userId + ", plan: " + planCode);

            // Find user by ID
            Optional<User> userOpt = userId.isEmpty() ? Optional.empty() : userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setCurrentPlan(planCode);
                user.setSubscriptionEndDate(LocalDate.now().plusYears(1));
                userRepository.save(user);
                System.out.println("Updated plan for userId: " + userId + " to " + planCode);

                // Save payment record — skip if same TxnRef already processed (idempotency)
                if (!subscriptionRequestRepository.existsByVnpayTxnRef(vnp_TxnRef)) {
                    long amount = 0;
                    try { amount = Long.parseLong(vnp_AmountStr) / 100; } catch (Exception ignored) {}

                    SubscriptionRequest subReq = new SubscriptionRequest();
                    subReq.setUser(user);
                    subReq.setRequestedPlan(planCode);
                    subReq.setStatus(SubscriptionStatus.APPROVED);
                    subReq.setPaymentReference("VNPAY");
                    subReq.setVnpayTxnRef(vnp_TxnRef);
                    subReq.setAmount(amount);
                    subscriptionRequestRepository.save(subReq);
                    System.out.println("Saved payment history for userId: " + userId);
                } else {
                    System.out.println("Duplicate TxnRef ignored: " + vnp_TxnRef);
                }
            } else {
                System.out.println("WARNING: User not found for id: '" + userId + "', raw: '" + userIdNoHyphens + "'");
            }

            return new PaymentResponseDTO("SUCCESS",
                    "Thanh toán thành công! Gói " + planCode + " đã được kích hoạt.",
                    planCode);
        } else {
            return new PaymentResponseDTO("FAILED",
                    "Thanh toán thất bại (mã: " + vnp_ResponseCode + "). Vui lòng thử lại.",
                    null);
        }
    }

    // Requires authentication (JWT token in header)
    @GetMapping("/history")
    public List<Map<String, Object>> getPaymentHistory() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Fetching payment history for: " + username);

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                System.out.println("User not found for history: " + username);
                return List.of();
            }

            User user = userOpt.get();
            List<SubscriptionRequest> records = subscriptionRequestRepository
                    .findByUserIdOrderByCreatedAtDesc(user.getId());

            return records.stream()
                    .filter(r -> "VNPAY".equals(r.getPaymentReference()))
                    .map(r -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", r.getId());
                        map.put("plan", r.getRequestedPlan());
                        map.put("amount", r.getAmount() != null ? r.getAmount() : 0L);
                        map.put("vnpayTxnRef", r.getVnpayTxnRef() != null ? r.getVnpayTxnRef() : "");
                        map.put("status", r.getStatus().name());
                        map.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : "");
                        return map;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error fetching history: " + e.getMessage());
            return List.of();
        }
    }
}
