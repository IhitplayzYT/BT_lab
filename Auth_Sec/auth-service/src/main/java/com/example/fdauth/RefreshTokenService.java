package com.example.fdauth;

import com.example.fdauth.entity.RefreshToken;
import com.example.fdauth.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTtlDays;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               @Value("${app.jwt.refresh-ttl-days:7}") long refreshTtlDays) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTtlDays = refreshTtlDays;
    }

    @Transactional
    public RefreshToken createRefreshToken(String username) {
        // Delete existing refresh tokens for this user (single session model)
        refreshTokenRepository.deleteByUsername(username);
        
        RefreshToken refreshToken = new RefreshToken(
            UUID.randomUUID().toString(),
            username,
            LocalDateTime.now().plusDays(refreshTtlDays)
        );
        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public Optional<RefreshToken> verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            return Optional.empty();
        }
        if (token.getRevoked()) {
            return Optional.empty();
        }
        return Optional.of(token);
    }

    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

    @Transactional
    public void deleteByUsername(String username) {
        refreshTokenRepository.deleteByUsername(username);
    }

    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
