package com.example.demo.service;

import com.example.demo.model.Portfolio;
import com.example.demo.model.Stock;
import com.example.demo.repository.StockRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class StockServiceTest {

    @Mock
    private StockRepository stockRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private StockService stockService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        stockService = new StockService(stockRepository, restTemplate);
    }

    @Test
    void testFetchAndStoreStock_Success() throws Exception {
        // Mock API response
        String mockResponse = "{\"Time Series (Daily)\": {\"2023-10-01\": {\"1. open\": \"150.0\", \"2. high\": \"155.0\", \"3. low\": \"145.0\", \"4. close\": \"152.0\", \"5. volume\": \"10000\"}}}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(mockResponse, HttpStatus.OK);

        when(restTemplate.getForEntity(anyString(), eq(String.class))).thenReturn(responseEntity);
        when(objectMapper.readTree(mockResponse)).thenReturn(mock(JsonNode.class));
        when(stockRepository.saveAll(anyList())).thenReturn(Collections.emptyList());

        // Test
        stockService.fetchAndStoreStock("TATAMOTORS.BSE");

        // Verify
        verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        verify(stockRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testGetLatestStockBySymbol() {
        // Mock repository response
        Stock mockStock = new Stock("TATAMOTORS.BSE", LocalDate.now(), 150.0, 155.0, 145.0, 152.0, 10000L, LocalDateTime.now());
        when(stockRepository.findLatestBySymbol("TATAMOTORS.BSE")).thenReturn(Optional.of(mockStock));

        // Test
        Optional<Stock> result = stockService.getLatestStockBySymbol("TATAMOTORS.BSE");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(152.0, result.get().getClosePrice());
    }

    @Test
    void testGetCurrentPrice_StockNotFound() {
        when(stockRepository.findLatestBySymbol("INVALID.BSE")).thenReturn(Optional.empty());

        Double result = stockService.getCurrentPrice("INVALID.BSE");

        assertNull(result);
    }

    @Test
    void testEnrichWithCurrentPrices() {
        // Setup portfolio items
        Portfolio portfolio1 = new Portfolio(1L, "TATAMOTORS.BSE", 10, 140.0, LocalDate.now());
        Portfolio portfolio2 = new Portfolio(1L, "RELIANCE.BSE", 5, 2000.0, LocalDate.now());
        List<Portfolio> portfolios = Arrays.asList(portfolio1, portfolio2);

        // Mock current prices
        Stock stock1 = new Stock("TATAMOTORS.BSE", LocalDate.now(), 150.0, 155.0, 145.0, 152.0, 10000L, LocalDateTime.now());
        Stock stock2 = new Stock("RELIANCE.BSE", LocalDate.now(), 2100.0, 2150.0, 2050.0, 2120.0, 5000L, LocalDateTime.now());

        when(stockRepository.findLatestBySymbol("TATAMOTORS.BSE")).thenReturn(Optional.of(stock1));
        when(stockRepository.findLatestBySymbol("RELIANCE.BSE")).thenReturn(Optional.of(stock2));

        // Test
        List<Portfolio> enrichedPortfolios = stockService.enrichWithCurrentPrices(portfolios);

        // Assert
        assertEquals(152.0, enrichedPortfolios.get(0).getCurrentPrice());
        assertEquals(2120.0, enrichedPortfolios.get(1).getCurrentPrice());
    }

    @Test
    void testGetStockBySymbol() {
        List<Stock> mockStocks = Arrays.asList(
                new Stock("TATAMOTORS.BSE", LocalDate.now().minusDays(1), 148.0, 150.0, 145.0, 149.0, 8000L, LocalDateTime.now()),
                new Stock("TATAMOTORS.BSE", LocalDate.now(), 150.0, 155.0, 145.0, 152.0, 10000L, LocalDateTime.now())
        );
        when(stockRepository.findBySymbol("TATAMOTORS.BSE")).thenReturn(mockStocks);

        List<Stock> result = stockService.getStockBySymbol("TATAMOTORS.BSE");

        assertEquals(2, result.size());
        assertEquals(149.0, result.get(0).getClosePrice());
    }
}