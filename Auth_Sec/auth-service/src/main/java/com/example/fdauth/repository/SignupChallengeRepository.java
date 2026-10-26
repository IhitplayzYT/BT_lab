package com.example.fdauth.repository;

import com.example.fdauth.entity.SignupChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignupChallengeRepository extends JpaRepository<SignupChallenge, String> { }
