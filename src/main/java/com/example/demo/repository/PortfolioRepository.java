package com.example.demo.repository;

import com.example.demo.model.Portfolio;
import com.example.demo.model.PortfolioId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, PortfolioId> {
    Optional<Portfolio> findById(PortfolioId id);
    List<Portfolio> findByUserId(Long userId);
}
