package com.example.demo.repository;

import com.example.demo.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByUserId(Long userId);
    List<Trade> findByUserIdAndSymbol(Long userId, String symbol);
}