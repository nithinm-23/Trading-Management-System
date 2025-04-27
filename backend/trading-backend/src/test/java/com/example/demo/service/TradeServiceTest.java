package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.PortfolioRepository;
import com.example.demo.repository.TradeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private UserService userService;

    @Mock
    private StockService stockService;

    @InjectMocks
    private TradeService tradeService;

    private final Long userId = 1L;
    private final String symbol = "TATAMOTORS.BSE";
    private final int quantity = 10;
    private final double price = 150.0;

    @Test
    void executeTrade_Buy_NewPosition() {
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(portfolioRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Optional.empty());
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Trade result = tradeService.executeTrade(userId, symbol, TradeType.BUY, quantity, price);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(symbol, result.getSymbol());
        assertEquals(TradeType.BUY, result.getType());
        assertEquals(quantity, result.getQuantity());
        assertEquals(price, result.getPrice());

        verify(portfolioRepository).save(any(Portfolio.class));
        verify(userService).deductFunds(userId, price * quantity);
    }

    @Test
    void executeTrade_Buy_ExistingPosition() {
        Portfolio existing = new Portfolio(userId, symbol, 5, 140.0, LocalDate.now());
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(portfolioRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Optional.of(existing));
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Trade result = tradeService.executeTrade(userId, symbol, TradeType.BUY, quantity, price);

        assertNotNull(result);
        verify(portfolioRepository).save(existing);
        assertEquals(15, existing.getQuantity());
        assertEquals((5*140.0 + 10*150.0)/15, existing.getPurchasePrice());
    }

    @Test
    void executeTrade_Sell_FullPosition() {
        Portfolio existing = new Portfolio(userId, symbol, quantity, 140.0, LocalDate.now());
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(portfolioRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Optional.of(existing));
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Trade result = tradeService.executeTrade(userId, symbol, TradeType.SELL, quantity, price);

        assertNotNull(result);
        verify(portfolioRepository).delete(existing);
        verify(userService).addFunds(userId, price * quantity);
    }

    @Test
    void executeTrade_Sell_PartialPosition() {
        int sellQuantity = 5;
        Portfolio existing = new Portfolio(userId, symbol, 10, 140.0, LocalDate.now());
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(portfolioRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Optional.of(existing));
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Trade result = tradeService.executeTrade(userId, symbol, TradeType.SELL, sellQuantity, price);

        assertNotNull(result);
        verify(portfolioRepository).save(existing);
        assertEquals(5, existing.getQuantity());
        assertEquals(140.0, existing.getPurchasePrice()); // Price shouldn't change for sells
    }

    @Test
    void executeTrade_ShouldThrowWhenPriceMismatch() {
        double currentPrice = 155.0;
        when(stockService.getCurrentPrice(symbol)).thenReturn(currentPrice);

        assertThrows(IllegalStateException.class, () ->
                tradeService.executeTrade(userId, symbol, TradeType.BUY, quantity, price));
    }

    @Test
    void executeTrade_ShouldThrowWhenInsufficientQuantity() {
        Portfolio existing = new Portfolio(userId, symbol, 5, 140.0, LocalDate.now());
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(portfolioRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Optional.of(existing));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                tradeService.executeTrade(userId, symbol, TradeType.SELL, quantity, price));

        assertEquals(
                String.format("Insufficient quantity. Available: %d, Requested: %d",
                        existing.getQuantity(), quantity),
                exception.getMessage()
        );
    }

    @Test
    void executeTrade_ShouldThrowWhenNoPositionToSell() {
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(portfolioRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Optional.empty());

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                tradeService.executeTrade(userId, symbol, TradeType.SELL, quantity, price));

        assertEquals(
                String.format("No position found to sell for user %d and symbol %s", userId, symbol),
                exception.getMessage()
        );
    }

    @Test
    void executeTrade_ShouldHandleDatabaseError() {
        when(stockService.getCurrentPrice(symbol)).thenReturn(price);
        when(tradeRepository.save(any(Trade.class))).thenThrow(new DataIntegrityViolationException("DB error"));

        assertThrows(TradeExecutionException.class, () ->
                tradeService.executeTrade(userId, symbol, TradeType.BUY, quantity, price));
    }

    @Test
    void getUserTrades_ShouldReturnTrades() {
        Trade trade = new Trade();
        trade.setUserId(userId);
        trade.setSymbol(symbol);
        trade.setType(TradeType.BUY);
        trade.setQuantity(quantity);
        trade.setPrice(price);
        trade.setTimestamp(LocalDateTime.now());

        when(tradeRepository.findByUserId(userId)).thenReturn(Collections.singletonList(trade));

        List<Trade> result = tradeService.getUserTrades(userId);

        assertEquals(1, result.size());
        assertEquals(trade, result.get(0));
    }

    @Test
    void getUserTradesForStock_ShouldReturnFilteredTrades() {
        Trade trade = new Trade();
        trade.setUserId(userId);
        trade.setSymbol(symbol);
        trade.setType(TradeType.BUY);
        trade.setQuantity(quantity);
        trade.setPrice(price);
        trade.setTimestamp(LocalDateTime.now());

        when(tradeRepository.findByUserIdAndSymbol(userId, symbol)).thenReturn(Collections.singletonList(trade));

        List<Trade> result = tradeService.getUserTradesForStock(userId, symbol);

        assertEquals(1, result.size());
        assertEquals(trade, result.get(0));
    }

    @Test
    void validateTradeInputs_ShouldThrowForInvalidInputs() {
        // Test various invalid input scenarios
        assertThrows(IllegalArgumentException.class, () ->
                tradeService.executeTrade(null, symbol, TradeType.BUY, quantity, price));

        assertThrows(IllegalArgumentException.class, () ->
                tradeService.executeTrade(userId, "", TradeType.BUY, quantity, price));

        assertThrows(IllegalArgumentException.class, () ->
                tradeService.executeTrade(userId, symbol, TradeType.BUY, 0, price));

        assertThrows(IllegalArgumentException.class, () ->
                tradeService.executeTrade(userId, symbol, TradeType.BUY, quantity, 0));
    }
}