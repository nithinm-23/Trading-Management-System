package com.example.demo.service;

import com.example.demo.model.Stock;
import com.example.demo.model.User;
import com.example.demo.model.Watchlist;
import com.example.demo.model.WatchlistStock;
import com.example.demo.repository.StockRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WatchlistRepository;
import com.example.demo.repository.WatchlistStockRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WatchlistServiceTest {

    @InjectMocks
    private WatchlistService watchlistService;

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private StockRepository stockRepository;

    @Mock
    private WatchlistStockRepository watchlistStockRepository;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        watchlistService = new WatchlistService(watchlistRepository, stockRepository, watchlistStockRepository, userRepository);
    }

    @Test
    void createWatchlist_Success() {
        Long userId = 1L;
        User user = new User();
        Watchlist watchlist = new Watchlist("My Watchlist", user);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(watchlistRepository.save(any(Watchlist.class))).thenReturn(watchlist);

        Watchlist result = watchlistService.createWatchlist(userId, "My Watchlist");

        assertNotNull(result);
        assertEquals("My Watchlist", result.getName());
        verify(userRepository).findById(userId);
        verify(watchlistRepository).save(any(Watchlist.class));
    }

    @Test
    void createWatchlist_UserNotFound_ShouldThrow() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> watchlistService.createWatchlist(1L, "Watchlist"));
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserWatchlists_Success() {
        Long userId = 1L;
        List<Watchlist> watchlists = List.of(new Watchlist(), new Watchlist());

        when(watchlistRepository.findByUserId(userId)).thenReturn(watchlists);

        List<Watchlist> result = watchlistService.getUserWatchlists(userId);

        assertEquals(2, result.size());
        verify(watchlistRepository).findByUserId(userId);
    }

    @Test
    void deleteWatchlist_Success() {
        Long watchlistId = 1L;

        watchlistService.deleteWatchlist(watchlistId);

        verify(watchlistRepository).deleteById(watchlistId);
    }

    @Test
    void addLatestStockToWatchlist_Success() {
        Long watchlistId = 1L;
        String symbol = "AAPL";

        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setDate(LocalDate.now());

        Watchlist watchlist = new Watchlist();
        WatchlistStock watchlistStock = new WatchlistStock(watchlist, stock);

        when(stockRepository.findLatestBySymbol(symbol)).thenReturn(Optional.of(stock));
        when(watchlistRepository.findById(watchlistId)).thenReturn(Optional.of(watchlist));
        when(watchlistStockRepository.save(any(WatchlistStock.class))).thenReturn(watchlistStock);

        String result = watchlistService.addLatestStockToWatchlist(watchlistId, symbol);

        assertTrue(result.contains(symbol));
        verify(stockRepository).findLatestBySymbol(symbol);
        verify(watchlistRepository).findById(watchlistId);
        verify(watchlistStockRepository).save(any(WatchlistStock.class));
    }

    @Test
    void addLatestStockToWatchlist_StockNotFound() {
        when(stockRepository.findLatestBySymbol(anyString())).thenReturn(Optional.empty());

        String result = watchlistService.addLatestStockToWatchlist(1L, "AAPL");

        assertEquals("No stock data found for AAPL", result);
        verify(stockRepository).findLatestBySymbol("AAPL");
    }

    @Test
    void addLatestStockToWatchlist_WatchlistNotFound() {
        String symbol = "AAPL";
        Stock stock = new Stock();

        when(stockRepository.findLatestBySymbol(symbol)).thenReturn(Optional.of(stock));
        when(watchlistRepository.findById(anyLong())).thenReturn(Optional.empty());

        String result = watchlistService.addLatestStockToWatchlist(1L, symbol);

        assertEquals("Watchlist not found", result);
        verify(stockRepository).findLatestBySymbol(symbol);
        verify(watchlistRepository).findById(1L);
    }

    @Test
    void removeLatestStockFromWatchlist_Success() {
        Long watchlistId = 1L;
        String symbol = "AAPL";

        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setDate(LocalDate.now());

        Watchlist watchlist = new Watchlist();
        WatchlistStock watchlistStock = new WatchlistStock(watchlist, stock);

        when(stockRepository.findLatestBySymbol(symbol)).thenReturn(Optional.of(stock));
        when(watchlistRepository.findById(watchlistId)).thenReturn(Optional.of(watchlist));
        when(watchlistStockRepository.findByWatchlistAndStock(watchlist, stock)).thenReturn(Optional.of(watchlistStock));

        String result = watchlistService.removeLatestStockFromWatchlist(watchlistId, symbol);

        assertTrue(result.contains(symbol));
        verify(stockRepository).findLatestBySymbol(symbol);
        verify(watchlistRepository).findById(watchlistId);
        verify(watchlistStockRepository).findByWatchlistAndStock(watchlist, stock);
        verify(watchlistStockRepository).delete(watchlistStock);
    }

    @Test
    void removeLatestStockFromWatchlist_StockNotFound() {
        when(stockRepository.findLatestBySymbol(anyString())).thenReturn(Optional.empty());

        String result = watchlistService.removeLatestStockFromWatchlist(1L, "AAPL");

        assertEquals("No stock data found for AAPL", result);
        verify(stockRepository).findLatestBySymbol("AAPL");
    }

    @Test
    void removeLatestStockFromWatchlist_WatchlistNotFound() {
        String symbol = "AAPL";
        Stock stock = new Stock();

        when(stockRepository.findLatestBySymbol(symbol)).thenReturn(Optional.of(stock));
        when(watchlistRepository.findById(anyLong())).thenReturn(Optional.empty());

        String result = watchlistService.removeLatestStockFromWatchlist(1L, symbol);

        assertEquals("Watchlist not found", result);
        verify(stockRepository).findLatestBySymbol(symbol);
        verify(watchlistRepository).findById(1L);
    }

    @Test
    void removeLatestStockFromWatchlist_WatchlistStockNotFound() {
        String symbol = "AAPL";
        Stock stock = new Stock();
        Watchlist watchlist = new Watchlist();

        when(stockRepository.findLatestBySymbol(symbol)).thenReturn(Optional.of(stock));
        when(watchlistRepository.findById(1L)).thenReturn(Optional.of(watchlist));
        when(watchlistStockRepository.findByWatchlistAndStock(watchlist, stock)).thenReturn(Optional.empty());

        String result = watchlistService.removeLatestStockFromWatchlist(1L, symbol);

        assertEquals("Stock AAPL is not in the watchlist", result);
        verify(stockRepository).findLatestBySymbol(symbol);
        verify(watchlistRepository).findById(1L);
        verify(watchlistStockRepository).findByWatchlistAndStock(watchlist, stock);
    }

    @Test
    void getStocksInWatchlist_Success() {
        Long watchlistId = 1L;
        Watchlist watchlist = new Watchlist();
        Stock stock1 = new Stock();
        Stock stock2 = new Stock();
        WatchlistStock ws1 = new WatchlistStock(watchlist, stock1);
        WatchlistStock ws2 = new WatchlistStock(watchlist, stock2);

        when(watchlistRepository.findById(watchlistId)).thenReturn(Optional.of(watchlist));
        when(watchlistStockRepository.findByWatchlist(watchlist)).thenReturn(List.of(ws1, ws2));

        List<Stock> result = watchlistService.getStocksInWatchlist(watchlistId);

        assertEquals(2, result.size());
        verify(watchlistRepository).findById(watchlistId);
        verify(watchlistStockRepository).findByWatchlist(watchlist);
    }

    @Test
    void getStocksInWatchlist_WatchlistNotFound() {
        when(watchlistRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> watchlistService.getStocksInWatchlist(1L));
        verify(watchlistRepository).findById(1L);
    }

    @Test
    void getLatestStockSymbol_Success() {
        Long watchlistId = 1L;
        Stock stock = new Stock();
        stock.setSymbol("AAPL");
        WatchlistStock watchlistStock = new WatchlistStock(new Watchlist(), stock);

        when(watchlistStockRepository.findTopByWatchlistIdOrderByIdDesc(watchlistId)).thenReturn(Optional.of(watchlistStock));

        String symbol = watchlistService.getLatestStockSymbol(watchlistId);

        assertEquals("AAPL", symbol);
        verify(watchlistStockRepository).findTopByWatchlistIdOrderByIdDesc(watchlistId);
    }

    @Test
    void getLatestStockSymbol_NoStockFound() {
        when(watchlistStockRepository.findTopByWatchlistIdOrderByIdDesc(anyLong())).thenReturn(Optional.empty());

        String symbol = watchlistService.getLatestStockSymbol(1L);

        assertNull(symbol);
        verify(watchlistStockRepository).findTopByWatchlistIdOrderByIdDesc(1L);
    }
}
