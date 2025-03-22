package com.example.demo.service;

import com.example.demo.model.Trade;
import com.example.demo.model.TradeType;
import com.example.demo.repository.TradeRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TradeService {
    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;



    public TradeService(TradeRepository tradeRepository, UserRepository userRepository) {
        this.tradeRepository = tradeRepository;
        this.userRepository = userRepository;
    }

    public Trade placeTrade(Trade trade) {
        return tradeRepository.save(trade);
    }

    public List<Trade> getTradesByUser(Long userId) {
        return tradeRepository.findByUserId(userId);
    }

    public Trade executeTrade(Long userId, String tickerSymbol, TradeType tradeType, int quantity, BigDecimal tradePrice) {
        Trade trade = new Trade();
        trade.setUserId(userId);
        trade.setTickerSymbol(tickerSymbol);
        trade.setTradeType(tradeType);
        trade.setQuantity(quantity);
        trade.setTradePrice(tradePrice);
        trade.setTradeDate(LocalDateTime.now());

        return tradeRepository.save(trade);
    }

}
