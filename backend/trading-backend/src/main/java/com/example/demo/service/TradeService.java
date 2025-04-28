package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.TradeRepository;
import com.example.demo.repository.PortfolioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TradeService {

    public static final Logger logger = LoggerFactory.getLogger(TradeService.class);

    private final TradeRepository tradeRepository;
    private final PortfolioRepository portfolioRepository;
    private final UserService userService;
    private final StockService stockService;

    public TradeService(TradeRepository tradeRepository,
                        PortfolioRepository portfolioRepository,
                        UserService userService,
                        StockService stockService) {
        this.tradeRepository = tradeRepository;
        this.portfolioRepository = portfolioRepository;
        this.userService = userService;
        this.stockService = stockService;
    }

//    @Transactional
//    public Trade executeTrade(Long userId, String symbol, TradeType type,
//                              int quantity, double price) {
//        try {
//            // Validate inputs
//            validateTradeInputs(userId, symbol, quantity, price);
//
//            // Verify price matches current market price
//            double currentPrice = stockService.getCurrentPrice(symbol);
//            validatePriceMatch(price, currentPrice, symbol);
//
//            // Create and save trade record
//            Trade trade = createTradeRecord(userId, symbol, type, quantity, price);
//            Trade savedTrade = tradeRepository.save(trade);
//            logger.info("Trade recorded: {}", savedTrade.getId());
//
//            // Execute portfolio logic
//            executePortfolioUpdate(userId, symbol, type, quantity, price);
//
//            // Update user funds
//            updateUserFunds(userId, type, quantity, price);
//
//            return savedTrade;
//        } catch (DataIntegrityViolationException e) {
//            logger.error("Database error during trade execution", e);
//            throw new TradeExecutionException("Failed to save trade record", e);
//        }
//    }

    @Transactional
    public Trade executeTrade(Long userId, String symbol, TradeType type,
                              int quantity, double price) {
        try {
            // Validate inputs
            validateTradeInputs(userId, symbol, quantity, price);

            // Verify price matches current market price
            double currentPrice = stockService.getCurrentPrice(symbol);
            validatePriceMatch(price, currentPrice, symbol);

            // Create trade record
            Trade trade = createTradeRecord(userId, symbol, type, quantity, price);

            // Execute portfolio logic first (may throw exception)
            executePortfolioUpdate(userId, symbol, type, quantity, price);

            // Save trade record only after successful portfolio update
            Trade savedTrade = tradeRepository.save(trade);
            logger.info("Trade recorded for user {}: {}", userId, savedTrade.getId());

            // Update user funds
            updateUserFunds(userId, type, quantity, price);

            return savedTrade;
        } catch (DataIntegrityViolationException e) {
            logger.error("Database error during trade execution", e);
            throw new TradeExecutionException("Failed to save trade record", e);
        }
    }

    private void validateTradeInputs(Long userId, String symbol, int quantity, double price) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        if (symbol == null || symbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Stock symbol cannot be empty");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (price <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
    }

    private void validatePriceMatch(double submittedPrice, double currentPrice, String symbol) {
        if (Math.abs(submittedPrice - currentPrice) > 0.01) {
            throw new IllegalStateException(
                    String.format("Price mismatch for %s. Current: %.2f, Submitted: %.2f",
                            symbol, currentPrice, submittedPrice)
            );
        }
    }

    private Trade createTradeRecord(Long userId, String symbol, TradeType type,
                                    int quantity, double price) {
        Trade trade = new Trade();
        trade.setUserId(userId);
        trade.setSymbol(symbol);
        trade.setType(type);
        trade.setQuantity(quantity);
        trade.setPrice(price);
        trade.setTimestamp(LocalDateTime.now());
        return trade;
    }

    private void executePortfolioUpdate(Long userId, String symbol, TradeType type,
                                        int quantity, double price) {
        if (type == TradeType.BUY) {
            handleBuyTrade(userId, symbol, quantity, price);
        } else {
            handleSellTrade(userId, symbol, quantity, price);
        }
    }

    private void handleBuyTrade(Long userId, String symbol, int quantity, double price) {
        portfolioRepository.findByUserIdAndSymbol(userId, symbol)
                .ifPresentOrElse(
                        existing -> updateExistingPosition(existing, quantity, price),
                        () -> createNewPosition(userId, symbol, quantity, price)
                );
    }

    private void updateExistingPosition(Portfolio existing, int quantity, double price) {
        double totalCost = (existing.getPurchasePrice() * existing.getQuantity()) +
                (price * quantity);
        int totalQuantity = existing.getQuantity() + quantity;
        existing.setPurchasePrice(totalCost / totalQuantity);
        existing.setQuantity(totalQuantity);
        portfolioRepository.save(existing);
    }

    private void createNewPosition(Long userId, String symbol, int quantity, double price) {
        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(userId);
        portfolio.setSymbol(symbol);
        portfolio.setQuantity(quantity);
        portfolio.setPurchasePrice(price);
        portfolio.setPurchaseDate(LocalDate.now());
        portfolioRepository.save(portfolio);
    }

    private void handleSellTrade(Long userId, String symbol, int quantity, double price) {
        Portfolio existing = portfolioRepository.findByUserIdAndSymbol(userId, symbol)
                .orElseThrow(() -> new IllegalStateException(
                        String.format("No position found to sell for user %d and symbol %s",
                                userId, symbol)));

        if (existing.getQuantity() < quantity) {
            throw new IllegalStateException(
                    String.format("Insufficient quantity. Available: %d, Requested: %d",
                            existing.getQuantity(), quantity));
        }

        if (existing.getQuantity() == quantity) {
            portfolioRepository.delete(existing);
        } else {
            existing.setQuantity(existing.getQuantity() - quantity);
            portfolioRepository.save(existing);
        }
    }

    private void updateUserFunds(Long userId, TradeType type, int quantity, double price) {
        double amount = price * quantity;
        if (type == TradeType.BUY) {
            userService.deductFunds(userId, amount);
        } else {
            userService.addFunds(userId, amount);
        }
    }

    public List<Trade> getUserTrades(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        return tradeRepository.findByUserId(userId);
    }

    public List<Trade> getUserTradesForStock(Long userId, String symbol) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        if (symbol == null || symbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Stock symbol cannot be empty");
        }
        return tradeRepository.findByUserIdAndSymbol(userId, symbol);
    }
}