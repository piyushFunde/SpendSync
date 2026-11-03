package com.spendsync.api.service;

import com.spendsync.api.dto.request.LoginRequest;
import com.spendsync.api.dto.request.RegisterRequest;
import com.spendsync.api.dto.response.AuthResponse;
import com.spendsync.api.exception.BadRequestException;
import com.spendsync.api.model.User;
import com.spendsync.api.repository.UserRepository;
import com.spendsync.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String[] AVATAR_COLORS = {
        "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
        "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#84cc16"
    };

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        String avatarColor = AVATAR_COLORS[(int) (Math.random() * AVATAR_COLORS.length)];

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarColor(avatarColor)
                .currency(request.getCurrency())
                .roles(Set.of("USER"))
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarColor(avatarColor)
                .currency(user.getCurrency())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarColor(user.getAvatarColor())
                .currency(user.getCurrency())
                .build();
    }
}
