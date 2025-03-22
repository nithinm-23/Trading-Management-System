package com.example.demo.controller;

import com.example.demo.model.Portfolio;
import com.example.demo.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Portfolio>> getUserPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(portfolioService.getPortfolioByUser(userId));
    }
}
