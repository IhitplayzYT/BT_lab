package com.example.fdmodule.repository;

import com.example.fdmodule.entity.BundleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BundleItemRepository extends JpaRepository<BundleItem, Long> {
    List<BundleItem> findByBundleId(String bundleId);
    BundleItem findByFdAccountNo(String fdAccountNo);
    void deleteByBundleId(String bundleId);
}
