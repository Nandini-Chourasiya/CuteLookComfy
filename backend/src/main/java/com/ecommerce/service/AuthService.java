package com.ecommerce.service;

import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(Map<String, String> req, HttpServletResponse response) {
        String email = req.get("email");
        String password = req.get("password");
        String name = req.get("name");

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name != null ? name : email.split("@")[0])
            .role(Role.CUSTOMER)
            .isActive(true)
            .build();
        user = userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(email, user.getRole().name(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(email);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public AuthResponse login(Map<String, String> req, HttpServletResponse response) {
        String email = req.get("email");
        String password = req.get("password");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.isBlocked()) {
            throw new UnauthorizedException("Your account has been blocked");
        }

        String accessToken = tokenProvider.generateAccessToken(email, user.getRole().name(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(email);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public UserResponse getCurrentUser(User user) {
        return mapToUserResponse(user);
    }

    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst().orElse(null);
        }
        if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or missing refresh token");
        }
        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String newAccessToken = tokenProvider.generateAccessToken(email, user.getRole().name(), user.getId());
        return AuthResponse.builder()
            .accessToken(newAccessToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole().name())
            .profilePic(user.getProfilePic())
            .phone(user.getPhone())
            .gender(user.getGender())
            .dob(user.getDob())
            .isActive(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
