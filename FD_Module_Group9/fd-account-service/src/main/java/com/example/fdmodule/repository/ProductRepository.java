package com.example.fdmodule.repository;

import com.example.fdmodule.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
}
