# ER diagrams

Rendered as scalable SVG images from the SQL DDL and mounted account migrations. Open an SVG in a browser or an editor to zoom.

## Individual schemas

- [auth_db.svg](auth_db.svg) — auth service
- [banking_product_db.svg](banking_product_db.svg) — product service
- [fd_calculator.svg](fd_calculator.svg) — FD calculator
- [banking_technology_lab.svg](banking_technology_lab.svg) — FD account service
- [fd_batch.svg](fd_batch.svg) — interest batch service
- [fd_statements.svg](fd_statements.svg) — statement service
- [fd_notifications.svg](fd_notifications.svg) — notification service

## Combined diagram

- [combined-er-diagram.svg](combined-er-diagram.svg)

## Diagrams with relation lines

- [Individual and combined diagrams with cardinalities](with-relations/README.md)

## Scope

The original set includes declared tables, columns, primary keys, and declared foreign keys. The relation set adds dashed links for matching cross-service ID/code references; see its README for the distinction. The FD account schema combines the base setup and migrations used by the root `docker-compose.yml`. Runtime-only databases such as Mailpit and infrastructure containers have no application SQL schema in this repository.
