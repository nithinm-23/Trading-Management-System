package com.example.demo.repository;

import com.example.demo.model.Watchlist;
import com.example.demo.model.WatchlistStock;
import com.example.demo.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistStockRepository extends JpaRepository<WatchlistStock, Long> {

    Optional<WatchlistStock> findByWatchlistAndStock(Watchlist watchlist, Stock stock);

    List<WatchlistStock> findByWatchlist(Watchlist watchlist);

    Optional<WatchlistStock> findTopByWatchlistIdOrderByIdDesc(Long watchlistId);



}
