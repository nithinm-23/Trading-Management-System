package com.example.demo.repository;

import com.example.demo.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserId(Long userId);

    Optional<Portfolio> findByUserIdAndSymbol(Long userId, String symbol);

    @Modifying
    @Query("UPDATE Portfolio p SET p.quantity = p.quantity + :quantity WHERE p.userId = :userId AND p.symbol = :symbol")
    int updateQuantity(
            @Param("userId") Long userId,
            @Param("symbol") String symbol,
            @Param("quantity") int quantity
    );
}