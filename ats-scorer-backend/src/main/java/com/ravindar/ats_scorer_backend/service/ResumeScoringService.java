package com.ravindar.ats_scorer_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class ResumeScoringService {
    private final Tika tika = new Tika();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.api.key}")
    private String API_KEY;

    @Value("${app.model}")
    private String model;

    // Build the Api URL with model and API key
    @Value("${app.url}")
    private String url;

    public String scoreResume(MultipartFile resumeFile, MultipartFile jdFile)
            throws IOException, InterruptedException, TikaException {
        String resumeText = extractText(resumeFile);
        String jdText = extractText(jdFile);
        return sendToLLM(resumeText, jdText);
    }

    private String extractText(MultipartFile file) throws IOException, TikaException {
        String text = tika.parseToString(file.getInputStream()).trim();
        return text.length() > 15000 ? text.substring(0, 15000) : text;
    }

    private String sendToLLM(String resume, String jd) throws IOException, InterruptedException {

        // Construct  a prompt that tells the LLM what to do
        String prompt = String.format("""
    You are an ATS (Applicant Tracking System) scorer. Evaluate how well the resume matches the job description and provide a score out of 100.
    
    Use the following evaluation criteria:
    
    1. **Keyword Match (30 points)** – Does the resume include relevant keywords and terminology from the job description?
    2. **Skills Alignment (20 points)** – Are the candidate's skills closely aligned with those required in the job description?
    3. **Experience Relevance (20 points)** – Does the candidate have job experience that matches the role's responsibilities?
    4. **Education & Certifications (10 points)** – Does the candidate meet or exceed the educational and certification requirements?
    5. **Role Fit & Industry Knowledge (10 points)** – Does the resume reflect an understanding of the role and industry?
    6. **Achievements & Impact (10 points)** – Are the accomplishments relevant, quantified, and indicative of strong performance?

    Provide:
    - A total score out of 100.
    - A brief breakdown of the score across each category.
    - A short explanation summarizing why the resume is a good or poor fit.

    Job Description:
    %s

    Resume:
    %s
""", jd, resume);


        // Create a JSON request body with the prompt
        String requestBody = """
        {
          "generationConfig": {
                      "temperature": 0
                    },
          "contents": [
            {
              "parts": [
                {
                  "text": "%s"
                }
              ]
            }
          ]
        }
        """.formatted(escapeJson(prompt));

        // Build HTTP request with JSON content type
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        // Send request synchronously and get raw JSON response string
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Raw LLM response: " + response.body());

        // Parse and return the scored result from the response JSON
        return parseLLMResponse(response.body());
    }

    private String parseLLMResponse(String jsonResponse) throws IOException {
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText();
            }
        }
        return "No output found from Gemini.";
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
