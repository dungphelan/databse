package com.skyticket.modules.auth.controller;

import com.skyticket.modules.auth.entity.UserEntity;
import com.skyticket.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth Module", description = "Quản lý Người dùng & Ví nội bộ")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "Đăng ký mới", description = "Tạo user với email, mật khẩu.")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserEntity user) {
        try {
            return ResponseEntity.ok(authService.register(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Đăng nhập", description = "Gửi {email, password} để xác thực.")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            return ResponseEntity.ok(authService.login(credentials.get("email"), credentials.get("password")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Xem hồ sơ & Số dư", description = "Điền User ID vào đường dẫn.")
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(authService.getProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Nạp tiền ví", description = "Gửi {userId, amount} để cộng tiền.")
    @PostMapping("/wallet/top-up")
    public ResponseEntity<?> topUp(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());
            return ResponseEntity.ok(authService.topUpWallet(userId, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}