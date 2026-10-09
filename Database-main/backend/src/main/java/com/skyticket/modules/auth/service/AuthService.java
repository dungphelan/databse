package com.skyticket.modules.auth.service;

import com.skyticket.modules.auth.entity.UserEntity;
import com.skyticket.modules.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public UserEntity register(UserEntity newUser) {
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (newUser.getWalletBalance() == null) {
            newUser.setWalletBalance(BigDecimal.ZERO);
        }
        return userRepository.save(newUser);
    }

    public UserEntity login(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Sai mật khẩu!");
        }
        return user;
    }

    public UserEntity getProfile(Long id) {
    if (id == null) {
        throw new RuntimeException("ID không được để trống!");
    }
    return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));
}

    @Transactional
    public UserEntity topUpWallet(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0");
        }
        UserEntity user = getProfile(userId);
        user.setWalletBalance(user.getWalletBalance().add(amount));
        return userRepository.save(user);
    }
}