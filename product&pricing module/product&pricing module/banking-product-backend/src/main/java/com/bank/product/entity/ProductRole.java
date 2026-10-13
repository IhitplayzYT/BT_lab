package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "productRoles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "roleId")
    private Integer roleId;

    @Column(name = "roleType", nullable = false, length = 20)
    private String roleType;

    @Column(name = "isMandatory")
    private Boolean isMandatory;
}
