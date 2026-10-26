ALTER TABLE product_roles
    ADD CONSTRAINT uk_product_holder_role UNIQUE (product_id, role_type);

ALTER TABLE product_rate_variations
    ADD CONSTRAINT uk_product_category UNIQUE (product_id, customer_category);
