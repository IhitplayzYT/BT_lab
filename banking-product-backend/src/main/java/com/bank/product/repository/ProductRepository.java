package com.bank.product.repository;

import com.bank.product.entity.Product;
import com.bank.product.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByProductCode(String productCode);
    List<Product> findByProductTypeIgnoreCaseAndStatus(String productType, ProductStatus status);
    List<Product> findByStatus(ProductStatus status);
}
