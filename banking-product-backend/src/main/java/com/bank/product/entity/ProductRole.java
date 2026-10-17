package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "role_type", nullable = false, length = 20)
    private String roleType;

    @Column(name = "is_mandatory")
    private Boolean isMandatory;
}
