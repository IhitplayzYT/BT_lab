package com.bank.product.repository;

import com.bank.product.entity.Product;
import com.bank.product.entity.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecifications {

    public static Specification<Product> filterProducts(String productType, LocalDate startDate, LocalDate endDate) {
        return filterProducts(productType, startDate, endDate, null);
    }

    public static Specification<Product> filterProducts(String productType, LocalDate startDate, LocalDate endDate, String status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (productType != null && !productType.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("productType")), productType.trim().toUpperCase()));
            }

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("effectiveDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("effectiveDate"), endDate));
            }

            if (status != null && !status.trim().isEmpty()) {
                try {
                    ProductStatus ps = ProductStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), ps));
                } catch (IllegalArgumentException ignored) {
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
