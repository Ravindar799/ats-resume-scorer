package com.ravindar.ats_scorer_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
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
        final String API_KEY = "AIzaSyCfmcKVze0INUsFOK057pJURYGM04AhcDo";
        String model = "models/gemini-2.5-pro";
        String url = "https://generativelanguage.googleapis.com/v1beta/" + model + ":generateContent?key=" + API_KEY;

        // Construct proper JSON body
        String prompt = String.format("""
            You are an ATS scorer. Score the resume out of 100 based on how well it matches the job description. Provide both the score and a brief explanation.
            
            Job Description:
            %s

            Resume:
            %s
        """, jd, resume);

        String requestBody = """
        {
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

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Raw LLM response: " + response.body());

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
