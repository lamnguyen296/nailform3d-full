package com.restapi.identityservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import java.nio.charset.StandardCharsets;

@Service
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("classpath:knowledge_base.txt")
    private Resource knowledgeBaseResource;

    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private String systemPrompt = "Bạn là Trợ lý AI độc quyền của hệ thống Nailform3D - Nền tảng thiết kế móng tay 3D chuyên nghiệp. " +
            "Nhiệm vụ của bạn là giải đáp thắc mắc của khách hàng về sản phẩm, cách thiết kế móng 3D, và các gói cước (Pricing). " +
            "LƯU Ý CỰC KỲ QUAN TRỌNG: Bạn CHỈ được trả lời các chủ đề liên quan đến ngành Nail, thiết kế 3D, ứng dụng Nailform3D và bảng giá. " +
            "Tuyệt đối KHÔNG trả lời các câu hỏi về toán học, lập trình (code), chính trị, tôn giáo, thời tiết hay bất kỳ lĩnh vực nào khác ngoài ngành Nail và ứng dụng này. " +
            "Nếu bị hỏi ngoài luồng, hãy từ chối lịch sự và lái câu chuyện về Nailform3D. Hãy trả lời ngắn gọn, thân thiện và bằng tiếng Việt.";

    @PostConstruct
    public void init() {
        try {
            String knowledgeBase = new String(knowledgeBaseResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            systemPrompt = systemPrompt + "\n\nDưới đây là thông tin chi tiết về dự án Nailform3D để bạn sử dụng làm kiến thức nền tảng trả lời khách hàng:\n" + knowledgeBase;
            System.out.println("✅ Loaded knowledge_base.txt successfully into Chatbot System Prompt!");
        } catch (Exception e) {
            System.err.println("❌ Could not load knowledge_base.txt: " + e.getMessage());
        }
    }

    public String askQuestion(String userMessage) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct Gemini Request Body
            Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", userMessage)))
                )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    GEMINI_URL + apiKey, 
                    entity, 
                    Map.class
            );

            // Parse response
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Đã xảy ra lỗi khi kết nối tới Trợ lý ảo. Lỗi: " + e.getMessage();
        }
    }
}
