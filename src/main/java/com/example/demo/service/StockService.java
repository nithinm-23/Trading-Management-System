package com.example.demo.service;

import com.example.demo.model.Stock;
import com.example.demo.repository.StockRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class StockService {
    private final StockRepository stockRepository;
    private final RestTemplate restTemplate;

    @Value("${alpha_vantage.api.key}")
    private String apiKey;

    private static final List<String> INDIAN_STOCKS = Arrays.asList("IRCTC.BSE", "TCS.BSE", "INFY.BSE","ZOMATO.BSE","RELIANCE.BSE");
    private int currentStockIndex = 0;  // Tracks which stock to fetch next

    public StockService(StockRepository stockRepository, RestTemplate restTemplate) {
        this.stockRepository = stockRepository;
        this.restTemplate = restTemplate;
    }

//    @Scheduled(cron = "0 * 9-10 * * ?") // Runs every minute from 09:00 to 10:59 (IST)
//    public void fetchStockDataScheduled() {
//        if (INDIAN_STOCKS.isEmpty()) {
//            System.out.println("No stocks to fetch.");
//            return;
//        }
//
//        String stockSymbol = INDIAN_STOCKS.get(currentStockIndex);
//        fetchAndStoreStock(stockSymbol);
//
//        // Move to the next stock (round-robin)
//        currentStockIndex = (currentStockIndex + 1) % INDIAN_STOCKS.size();
//    }

    public void fetchAndStoreStock(String stockSymbol) {
        try {
            String apiUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="
                    + stockSymbol + "&apikey=" + apiKey;

            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String responseBody = response.getBody();
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(responseBody);

                JsonNode timeSeries = root.path("Time Series (Daily)");
                if (!timeSeries.isMissingNode()) {
                    List<Stock> stockList = new ArrayList<>();

                    // Iterate over the last 100 days
                    int count = 0;
                    for (Iterator<String> it = timeSeries.fieldNames(); it.hasNext() && count < 100; count++) {
                        String date = it.next();
                        JsonNode stockData = timeSeries.path(date);

                        if (!stockData.isMissingNode()) {
                            Stock stock = new Stock(
                                    stockSymbol,
                                    LocalDate.parse(date),
                                    stockData.path("1. open").asDouble(),
                                    stockData.path("2. high").asDouble(),
                                    stockData.path("3. low").asDouble(),
                                    stockData.path("4. close").asDouble(),
                                    stockData.path("5. volume").asLong(),
                                    LocalDateTime.now()
                            );
                            stockList.add(stock);
                        }
                    }

                    // Save all 100 records in a batch
                    stockRepository.saveAll(stockList);
                    System.out.println("Stored 100 days of stock data for: " + stockSymbol);
                } else {
                    System.err.println("No stock data found for: " + stockSymbol);
                }
            } else {
                System.err.println("Error fetching stock data: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Error fetching stock data for: " + stockSymbol);
            e.printStackTrace();
        }
    }


    private String getLatestDate(JsonNode timeSeries) {
        return timeSeries.fieldNames().hasNext() ? timeSeries.fieldNames().next() : null;
    }

    // New method to fetch all stocks
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public List<Stock> getStockBySymbol(String symbol) {
        return stockRepository.findBySymbol(symbol);
    }

    // Fetch the latest stock entry for a symbol
    public Optional<Stock> getLatestStockBySymbol(String symbol) {
        return stockRepository.findLatestBySymbol(symbol);
    }
}