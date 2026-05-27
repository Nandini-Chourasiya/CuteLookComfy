package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody Map<String, String> req,
                                                               HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(req, response)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody Map<String, String> req,
                                                            HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(req, response)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(user)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(request, response)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
