package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminStatsResponse {
    private long todayOrders;
    private BigDecimal todayRevenue;
    private long pendingOrders;
    private long totalProducts;
    private BigDecimal monthRevenue;
    private long totalCustomers;
    private long lowStockCount;
    private BigDecimal avgOrderValue;
}
