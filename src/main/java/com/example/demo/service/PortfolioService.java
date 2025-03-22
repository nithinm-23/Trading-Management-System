package com.example.demo.service;

import com.example.demo.model.Portfolio;
import com.example.demo.model.PortfolioId;
import com.example.demo.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    public PortfolioService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    public List<Portfolio> getPortfolioByUser(Long userId) {
        return portfolioRepository.findByUserId(userId);
    }

    public Portfolio getPortfolioEntry(Long userId, String tickerSymbol) {
        return portfolioRepository.findById(new PortfolioId(userId, tickerSymbol)).orElse(null);
    }
}
