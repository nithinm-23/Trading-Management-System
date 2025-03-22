package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.StockRepository;
import com.example.demo.repository.WatchlistRepository;
import com.example.demo.repository.WatchlistStockRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final StockRepository stockRepository;
    private final WatchlistStockRepository watchlistStockRepository;
    private final UserRepository userRepository;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            StockRepository stockRepository,
                            WatchlistStockRepository watchlistStockRepository,
                            UserRepository userRepository) {
        this.watchlistRepository = watchlistRepository;
        this.stockRepository = stockRepository;
        this.watchlistStockRepository = watchlistStockRepository;
        this.userRepository = userRepository;
    }

    // ✅ Create Watchlist
    public Watchlist createWatchlist(Long userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Watchlist watchlist = new Watchlist(name, user);
        return watchlistRepository.save(watchlist);
    }

    // ✅ Get All Watchlists for a User
    public List<Watchlist> getUserWatchlists(Long userId) {
        return watchlistRepository.findByUserId(userId);
    }

    // ✅ Delete a Watchlist
    public void deleteWatchlist(Long watchlistId) {
        watchlistRepository.deleteById(watchlistId);
    }

    public String addLatestStockToWatchlist(Long watchlistId, String symbol) {
        // ✅ Find the latest stock entry for the given symbol
        Optional<Stock> latestStockOpt = stockRepository.findLatestBySymbol(symbol);
        if (latestStockOpt.isEmpty()) {
            return "No stock data found for " + symbol;
        }
        Stock latestStock = latestStockOpt.get(); // This is a Stock object

        // ✅ Find the watchlist by ID
        Optional<Watchlist> watchlistOpt = watchlistRepository.findById(watchlistId);
        if (watchlistOpt.isEmpty()) {
            return "Watchlist not found";
        }
        Watchlist watchlist = watchlistOpt.get();

        // ✅ Wrap Stock inside WatchlistStock
        WatchlistStock watchlistStock = new WatchlistStock(watchlist, latestStock);

        // ✅ Save WatchlistStock
        watchlistStockRepository.save(watchlistStock);

        return "Stock " + symbol + " (Latest date: " + latestStock.getDate() + ") added to watchlist " + watchlistId;
    }


    public String removeLatestStockFromWatchlist(Long watchlistId, String symbol) {
        Optional<Stock> latestStockOpt = stockRepository.findLatestBySymbol(symbol);
        if (latestStockOpt.isEmpty()) {
            return "No stock data found for " + symbol;
        }
        Stock latestStock = latestStockOpt.get();

        Optional<Watchlist> watchlistOpt = watchlistRepository.findById(watchlistId);
        if (watchlistOpt.isEmpty()) {
            return "Watchlist not found";
        }
        Watchlist watchlist = watchlistOpt.get();

        Optional<WatchlistStock> watchlistStockOpt = watchlistStockRepository
                .findByWatchlistAndStock(watchlist, latestStock);

        if (watchlistStockOpt.isEmpty()) {
            return "Stock " + symbol + " is not in the watchlist";
        }

        watchlistStockRepository.delete(watchlistStockOpt.get());
        return "Stock " + symbol + " (Latest date: " + latestStock.getDate() + ") removed from watchlist " + watchlistId;
    }

    // ✅ Get Stocks in a Watchlist
    public List<Stock> getStocksInWatchlist(Long watchlistId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new RuntimeException("Watchlist not found"));

        return watchlistStockRepository.findByWatchlist(watchlist)
                .stream()
                .map(WatchlistStock::getStock)
                .toList();
    }

    public String getLatestStockSymbol(Long watchlistId) {
        Optional<WatchlistStock> latestWatchlistStock = watchlistStockRepository
                .findTopByWatchlistIdOrderByIdDesc(watchlistId);  // Fetch latest stock for the watchlist

        return latestWatchlistStock
                .map(watchlistStock -> watchlistStock.getStock().getSymbol())  // Get symbol
                .orElse(null);  // Return null if not found
    }

}
