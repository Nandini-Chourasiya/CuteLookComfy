package com.ecommerce.service;

import com.ecommerce.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Async
    public void sendOrderConfirmation(Order order) {
        sendEmail(order.getUser().getEmail(), "Order Confirmed - #" + order.getId().toString().substring(0, 8).toUpperCase(),
            "email/order-placed", buildOrderContext(order));
    }

    @Async
    public void sendOrderShipped(Order order) {
        sendEmail(order.getUser().getEmail(), "Your Order Has Been Shipped!",
            "email/order-shipped", buildOrderContext(order));
    }

    @Async
    public void sendOrderDelivered(Order order) {
        sendEmail(order.getUser().getEmail(), "Order Delivered - How was it?",
            "email/order-delivered", buildOrderContext(order));
    }

    @Async
    public void sendOrderCancelled(Order order) {
        sendEmail(order.getUser().getEmail(), "Order Cancelled - #" + order.getId().toString().substring(0, 8).toUpperCase(),
            "email/order-cancelled", buildOrderContext(order));
    }

    @Async
    public void sendRefundConfirmation(Order order) {
        sendEmail(order.getUser().getEmail(), "Refund Initiated",
            "email/refund-initiated", buildOrderContext(order));
    }

    @Async
    public void sendReturnConfirmation(Order order) {
        sendEmail(order.getUser().getEmail(), "Return Request Received",
            "email/return-received", buildOrderContext(order));
    }

    private void sendEmail(String to, String subject, String template, Context ctx) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(templateEngine.process(template, ctx), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private Context buildOrderContext(Order order) {
        Context ctx = new Context();
        ctx.setVariable("order", order);
        ctx.setVariable("customerName", order.getUser().getName());
        return ctx;
    }
}
