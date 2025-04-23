package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Value("${newsapi.key}")
    private String newsApiKey;

    @GetMapping("/market")
    public ResponseEntity<Map<String, Object>> getMarketNews() {
        String url = "https://newsapi.org/v2/top-headlines?category=business&apiKey=" + newsApiKey;

        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return new ResponseEntity<>(response.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to fetch news");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 2. Advanced Search Endpoint
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNews(
            @RequestParam String query,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        String url = String.format(
                "https://newsapi.org/v2/everything?q=%s&apiKey=%s%s%s%s",
                encodeQuery(query),
                newsApiKey,
                sortBy != null ? "&sortBy=" + sortBy : "",
                fromDate != null ? "&from=" + fromDate : "",
                toDate != null ? "&to=" + toDate : ""
        );
        RestTemplate restTemplate = new RestTemplate();
        return ResponseEntity.ok(restTemplate.getForObject(url, Map.class));
    }

    // 3. News Sources Endpoint
    @GetMapping("/sources")
    public ResponseEntity<List<Map<String, String>>> getNewsSources() {
        String url = "https://newsapi.org/v2/everything/sources?apiKey=" + newsApiKey;
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Map<String, String>> sources = ((List<?>) response.get("sources")).stream()
                .map(source -> (Map<String, String>) source)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sources);
    }

    private String encodeQuery(String query) {
        return query.replace(" ", "%20")
                .replace("AND", "%20AND%20")
                .replace("OR", "%20OR%20");
    }
}