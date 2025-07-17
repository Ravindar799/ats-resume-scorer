package com.ravindar.ats_scorer_backend.controller;

import com.ravindar.ats_scorer_backend.service.ResumeScoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
