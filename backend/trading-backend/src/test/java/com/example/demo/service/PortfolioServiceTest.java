package com.example.demo.service;

import com.example.demo.model.Portfolio;
import com.example.demo.model.Stock;
import com.example.demo.model.User;
import com.example.demo.repository.PortfolioRepository;
import com.example.demo.repository.StockRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PortfolioServiceTest {

    private PortfolioRepository portfolioRepository;
    private StockRepository stockRepository;
    private UserRepository userRepository;
    private PortfolioService portfolioService;

    @BeforeEach
    public void setup() {
        portfolioRepository = mock(PortfolioRepository.class);
        stockRepository = mock(StockRepository.class);
        userRepository = mock(UserRepository.class);
        portfolioService = new PortfolioService(portfolioRepository, stockRepository, userRepository);
    }

    @Test
    public void testGetPortfolioByUser() {
        Long userId = 1L;
        Portfolio p1 = new Portfolio();
        p1.setUserId(userId);
        p1.setSymbol("AAPL");

        when(portfolioRepository.findByUserId(userId)).thenReturn(Arrays.asList(p1));

        var result = portfolioService.getPortfolioByUser(userId);

        assertEquals(1, result.size());
        assertEquals("AAPL", result.get(0).getSymbol());
    }

    @Test
    public void testSaveOrUpdatePortfolio_NewEntry() {
        Portfolio newPortfolio = new Portfolio();
        newPortfolio.setUserId(1L);
        newPortfolio.setSymbol("AAPL");
        newPortfolio.setQuantity(10);
        newPortfolio.setPurchasePrice(150.0);

        when(portfolioRepository.findByUserIdAndSymbol(1L, "AAPL")).thenReturn(Optional.empty());
        when(portfolioRepository.save(newPortfolio)).thenReturn(newPortfolio);

        Portfolio saved = portfolioService.saveOrUpdatePortfolio(newPortfolio);

        assertEquals(10, saved.getQuantity());
        assertEquals(150.0, saved.getPurchasePrice());
    }

    @Test
    public void testSellStock_PartialSell() {
        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(1L);
        portfolio.setSymbol("AAPL");
        portfolio.setQuantity(10);
        portfolio.setPurchasePrice(150.0);

        Stock stock = new Stock();
        stock.setSymbol("AAPL");
        stock.setClosePrice(200.0);

        User user = new User();
        user.setId(1L);
        user.setBalance(1000.0);

        when(portfolioRepository.findByUserIdAndSymbol(1L, "AAPL")).thenReturn(Optional.of(portfolio));
        when(stockRepository.findBySymbol("AAPL")).thenReturn(Arrays.asList(stock));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(portfolioRepository.save(any(Portfolio.class))).thenReturn(portfolio);
        when(userRepository.save(any(User.class))).thenReturn(user);

        Portfolio updated = portfolioService.sellStock(1L, "AAPL", 5);

        assertNotNull(updated);
        assertEquals(5, updated.getQuantity());
        assertEquals(2000.0, user.getBalance());
    }

    @Test
    public void testSellStock_CompleteSell() {
        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(1L);
        portfolio.setSymbol("AAPL");
        portfolio.setQuantity(5);

        Stock stock = new Stock();
        stock.setSymbol("AAPL");
        stock.setClosePrice(200.0);

        User user = new User();
        user.setId(1L);
        user.setBalance(1000.0);

        when(portfolioRepository.findByUserIdAndSymbol(1L, "AAPL")).thenReturn(Optional.of(portfolio));
        when(stockRepository.findBySymbol("AAPL")).thenReturn(Arrays.asList(stock));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Portfolio result = portfolioService.sellStock(1L, "AAPL", 5);

        assertNull(result); // stock removed
        assertEquals(2000.0, user.getBalance());
        verify(portfolioRepository).delete(portfolio);
    }

    @Test
    public void testSellStock_StockNotFound_ThrowsException() {
        when(portfolioRepository.findByUserIdAndSymbol(1L, "AAPL")).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                portfolioService.sellStock(1L, "AAPL", 5)
        );

        assertEquals("Stock not found in portfolio", exception.getMessage());
    }

    @Test
    public void testSellStock_InsufficientQuantity_ThrowsException() {
        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(1L);
        portfolio.setSymbol("AAPL");
        portfolio.setQuantity(2); // Only 2 available

        when(portfolioRepository.findByUserIdAndSymbol(1L, "AAPL")).thenReturn(Optional.of(portfolio));

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                portfolioService.sellStock(1L, "AAPL", 5)
        );

        assertEquals("Insufficient stock quantity to sell", exception.getMessage());
    }

    @Test
    public void testFindById() {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(100L);

        when(portfolioRepository.findById(100L)).thenReturn(Optional.of(portfolio));

        Optional<Portfolio> result = portfolioService.findById(100L);

        assertTrue(result.isPresent());
        assertEquals(100L, result.get().getId());
    }

    @Test
    public void testFindByUserIdAndSymbol() {
        Portfolio portfolio = new Portfolio();
        portfolio.setUserId(1L);
        portfolio.setSymbol("AAPL");

        when(portfolioRepository.findByUserIdAndSymbol(1L, "AAPL")).thenReturn(Optional.of(portfolio));

        Optional<Portfolio> result = portfolioService.findByUserIdAndSymbol(1L, "AAPL");

        assertTrue(result.isPresent());
        assertEquals("AAPL", result.get().getSymbol());
    }

    @Test
    public void testDeletePortfolio() {
        portfolioService.deletePortfolio(55L);
        verify(portfolioRepository).deleteById(55L);
    }
}
