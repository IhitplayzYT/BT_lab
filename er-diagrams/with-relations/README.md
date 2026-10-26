# ER diagrams with relationships

These SVGs include relationship connectors and cardinality markers. The number beside a child table is `N` unless its referencing key is unique or a primary key, in which case it is `1`; the parent side is `1`.

- Solid blue connectors are foreign keys declared in SQL.
- Dashed amber connectors are logical references inferred from matching ID or product-code fields across the service schemas.
- Hover a connector in an SVG viewer to see the source and target columns.
- `External:` cards in an individual service diagram mark referenced entities owned by another database.

## Individual schemas

- [auth_db.svg](auth_db.svg)
- [banking_product_db.svg](banking_product_db.svg)
- [banking_technology_lab.svg](banking_technology_lab.svg)
- [fd_batch.svg](fd_batch.svg)
- [fd_calculator.svg](fd_calculator.svg)
- [fd_notifications.svg](fd_notifications.svg)
- [fd_statements.svg](fd_statements.svg)

## Combined diagram

- [combined-er-diagram.svg](combined-er-diagram.svg)
