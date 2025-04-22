package com.example.demo.service;

import com.example.demo.model.Portfolio;
import com.example.demo.model.User;
import com.example.demo.repository.PortfolioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.repository.StockRepository;
import com.example.demo.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;

    public PortfolioService(PortfolioRepository portfolioRepository, StockRepository stockRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.stockRepository = stockRepository;
        this.userRepository = userRepository;
    }

    public List<Portfolio> getPortfolioByUser(Long userId) {
        return portfolioRepository.findByUserId(userId);
    }

    @Transactional
    public Portfolio saveOrUpdatePortfolio(Portfolio portfolio) {
        Optional<Portfolio> existing = portfolioRepository.findByUserIdAndSymbol(
                portfolio.getUserId(),
                portfolio.getSymbol()
        );

        if (existing.isPresent()) {
            Portfolio current = existing.get();
            int newQuantity = current.getQuantity() + portfolio.getQuantity();
            double avgPrice = ((current.getPurchasePrice() * current.getQuantity()) +
                    (portfolio.getPurchasePrice() * portfolio.getQuantity())) /
                    newQuantity;

            current.setQuantity(newQuantity);
            current.setPurchasePrice(avgPrice);
            return portfolioRepository.save(current);
        }
        return portfolioRepository.save(portfolio);
    }

    @Transactional
    public void deletePortfolio(Long id) {
        portfolioRepository.deleteById(id);
    }

    public Optional<Portfolio> findById(Long id) {
        return portfolioRepository.findById(id);
    }

    public Optional<Portfolio> findByUserIdAndSymbol(Long userId, String symbol) {
        return portfolioRepository.findByUserIdAndSymbol(userId, symbol);
    }

    @Transactional
    public Portfolio sellStock(Long userId, String symbol, int quantity) {
        Portfolio portfolio = portfolioRepository.findByUserIdAndSymbol(userId, symbol)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found in portfolio"));

        if (portfolio.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock quantity to sell");
        }

        // Calculate sale amount (price should be fetched from a reliable source)
        double sellPrice = getStockPriceFromDatabase(symbol); // Implement this method
        double totalAmount = sellPrice * quantity;

        // Update user's funds
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setBalance(user.getBalance() + totalAmount);
        userRepository.save(user);

        // Update portfolio
        portfolio.setQuantity(portfolio.getQuantity() - quantity);
        if (portfolio.getQuantity() == 0) {
            portfolioRepository.delete(portfolio);
            return null;
        } else {
            return portfolioRepository.save(portfolio);
        }
    }

    // Helper method to get stock price
    private double getStockPriceFromDatabase(String symbol) {
        return stockRepository.findBySymbol(symbol)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Stock price not found"))
                .getClosePrice();
    }




}