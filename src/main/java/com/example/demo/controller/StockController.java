package com.example.demo.controller;

import com.example.demo.model.Stock;
import com.example.demo.repository.StockRepository;
import com.example.demo.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    private final StockService stockService;



//    public StockController(StockService stockService) {
//        this.stockService = stockService;
//    }

    private final StockRepository stockRepository;

    @Autowired
    public StockController(StockService stockService, StockRepository stockRepository) {
        this.stockService = stockService;
        this.stockRepository = stockRepository;
    }

    @GetMapping
    public List<Stock> getLatestStocks() {
        return stockRepository.findLatestStocks();
    }

    // Trigger stock fetch manually (for testing)
//    @PostMapping("/fetch")
//    public ResponseEntity<String> fetchStockManually() {
//        stockService.fetchStockDataScheduled();
//        return ResponseEntity.ok("Stock fetch triggered manually.");
//    }

    // New API: Fetch all stocks from the database
    @GetMapping("/all")
    public ResponseEntity<List<Stock>> getAllStocks() {
        List<Stock> stocks = stockService.getAllStocks();
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<List<Stock>> getStockBySymbol(@PathVariable String symbol) {
        List<Stock> stocks = stockService.getStockBySymbol(symbol);
        if (stocks.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stocks);
    }

    // Get the latest stock entry for a given symbol
    @GetMapping("/{symbol}/latest")
    public ResponseEntity<Stock> getLatestStockBySymbol(@PathVariable String symbol) {
        Optional<Stock> latestStock = stockService.getLatestStockBySymbol(symbol);
        return latestStock.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/fetchAll/{symbol}")
    public ResponseEntity<String> fetchAllStockData(@PathVariable String symbol) {
        stockService.fetchAndStoreStock(symbol);
        return ResponseEntity.ok("Stock data for 100 days fetched and stored for: " + symbol);
    }
}