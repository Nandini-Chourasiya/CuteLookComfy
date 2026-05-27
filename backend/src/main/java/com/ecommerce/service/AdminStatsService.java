package com.ecommerce.service;

import com.ecommerce.dto.response.AdminStatsResponse;
import com.ecommerce.dto.response.RevenueDataResponse;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AdminStatsResponse getStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        return AdminStatsResponse.builder()
            .todayOrders(orderRepository.countByPeriod(todayStart, todayEnd))
            .todayRevenue(orderRepository.sumRevenueByPeriod(todayStart, todayEnd))
            .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
            .totalProducts(productRepository.countByDeletedAtIsNull())
            .monthRevenue(orderRepository.sumRevenueByPeriod(monthStart, todayEnd))
            .totalCustomers(userRepository.countByRole(Role.CUSTOMER))
            .lowStockCount(productRepository.findLowStockProducts().size())
            .avgOrderValue(orderRepository.avgOrderValue())
            .build();
    }

    public List<RevenueDataResponse> getRevenue(int days) {
        List<RevenueDataResponse> result = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime from = date.atStartOfDay();
            LocalDateTime to = from.plusDays(1);
            BigDecimal revenue = orderRepository.sumRevenueByPeriod(from, to);
            long count = orderRepository.countByPeriod(from, to);
            result.add(RevenueDataResponse.builder()
                .date(date.toString()).revenue(revenue).orderCount(count).build());
        }
        return result;
    }

    public Map<String, Long> getOrdersByStatus() {
        return Map.of(
            "PENDING", orderRepository.countByStatus(OrderStatus.PENDING),
            "PAID", orderRepository.countByStatus(OrderStatus.PAID),
            "PROCESSING", orderRepository.countByStatus(OrderStatus.PROCESSING),
            "SHIPPED", orderRepository.countByStatus(OrderStatus.SHIPPED),
            "DELIVERED", orderRepository.countByStatus(OrderStatus.DELIVERED),
            "CANCELLED", orderRepository.countByStatus(OrderStatus.CANCELLED)
        );
    }

    public List<Object[]> getTopProducts(int limit) {
        return orderRepository.findAll().isEmpty() ? List.of() :
            productRepository.findAll().stream()
                .limit(limit).map(p -> new Object[]{p.getId(), p.getName(), 0L, BigDecimal.ZERO}).toList();
    }
}
