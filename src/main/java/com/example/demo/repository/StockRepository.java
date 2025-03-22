package com.example.demo.repository;

import com.example.demo.model.Stock;
import com.example.demo.model.StockId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, StockId> {
    List<Stock> findBySymbol(String symbol);

    @Query("SELECT s FROM Stock s WHERE s.symbol = :symbol ORDER BY s.date DESC LIMIT 1")
    Optional<Stock> findLatestBySymbol(@Param("symbol") String symbol);


}

