package com.example.demo.controller;

import com.example.demo.model.Watchlist;
import com.example.demo.model.Stock;
import com.example.demo.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlists")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    // ✅ Create Watchlist
    @PostMapping("/create")
    public ResponseEntity<Watchlist> createWatchlist(@RequestParam Long userId, @RequestParam String name) {
        return ResponseEntity.ok(watchlistService.createWatchlist(userId, name));
    }

    // ✅ Get All Watchlists for a User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Watchlist>> getUserWatchlists(@PathVariable Long userId) {
        return ResponseEntity.ok(watchlistService.getUserWatchlists(userId));
    }

    // ✅ Delete a Watchlist
    @DeleteMapping("/{watchlistId}")
    public ResponseEntity<String> deleteWatchlist(@PathVariable Long watchlistId) {
        watchlistService.deleteWatchlist(watchlistId);
        return ResponseEntity.ok("Watchlist deleted successfully");
    }


    // ✅ Add Stock to Watchlist (Auto-select latest entry)
    @PostMapping("/{watchlistId}/stocks/{symbol}")
    public ResponseEntity<String> addStockToWatchlist(
            @PathVariable Long watchlistId,
            @PathVariable String symbol) {

        String result = watchlistService.addLatestStockToWatchlist(watchlistId, symbol);
        return ResponseEntity.ok(result);
    }


    // ✅ Remove Stock from Watchlist
    // ✅ Remove the latest stock entry from the watchlist
    @DeleteMapping("/{watchlistId}/stocks/{symbol}")
    public ResponseEntity<String> removeStockFromWatchlist(
            @PathVariable Long watchlistId,
            @PathVariable String symbol) {

        String result = watchlistService.removeLatestStockFromWatchlist(watchlistId, symbol);
        return ResponseEntity.ok(result);
    }


    // ✅ Get Stocks in a Watchlist
    @GetMapping("/{watchlistId}/stocks")
    public ResponseEntity<List<Stock>> getStocksInWatchlist(@PathVariable Long watchlistId) {
        return ResponseEntity.ok(watchlistService.getStocksInWatchlist(watchlistId));
    }
}
