package com.example.fdauth.repository;

import com.example.fdauth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUsername(String username);
    void deleteByToken(String token);
    void deleteByUsername(String username);
    void deleteByExpiryDateBefore(LocalDateTime date);
}
