package com.ravindar.ats_scorer_backend.controller;

import com.ravindar.ats_scorer_backend.service.ResumeScoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeScoringService scoringService;

    @PostMapping("/score")
    public ResponseEntity<?> scoreResume(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("jobDesc") MultipartFile jobDesc) throws Exception {
        String scoreResult = scoringService.scoreResume(resume, jobDesc);
        return ResponseEntity.ok(scoreResult);
    }
}
