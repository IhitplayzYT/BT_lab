#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FD Calculator Service – Sample cURL commands
# Base URL: http://localhost:8084
# Replace TOKEN with a valid JWT (CUSTOMER role).
# ─────────────────────────────────────────────────────────────────────────────

BASE="http://localhost:8084"

# ─── Generate a dev token (requires jq and a Java JJWT utility) ───────────
# In dev, use the /docs/generate_dev_token.sh helper or copy a token from
# the Swagger UI "Authorize" dialog after obtaining one from the Auth Service.

TOKEN="<paste-your-jwt-here>"

# ─── 1. Health check (public, no token needed) ────────────────────────────
echo "=== Health ==="
curl -s "$BASE/actuator/health" | jq .

# ─── 2. Product preview (requires CUSTOMER JWT) ───────────────────────────
echo ""
echo "=== Product Preview ==="
curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE/api/v1/fd/products/FD001/preview" | jq .

# ─── 3. Calculate maturity (compound, cumulative, 12 months) ──────────────
echo ""
echo "=== Calculate Maturity ==="
curl -s -X POST "$BASE/api/v1/fd/calculations" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "principal": 100000.00,
           "term": { "value": 12, "unit": "MONTHS" },
           "productCode": "FD001",
           "payoutMode": "CUMULATIVE"
         }' | jq .

# ─── 4. Calculate maturity (2 years) ─────────────────────────────────────
echo ""
echo "=== Calculate Maturity (2 Years) ==="
curl -s -X POST "$BASE/api/v1/fd/calculations" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "principal": 500000.00,
           "term": { "value": 2, "unit": "YEARS" },
           "productCode": "FD001",
           "payoutMode": "CUMULATIVE"
         }' | jq .

# ─── 5. Compare two products ──────────────────────────────────────────────
echo ""
echo "=== Compare Products ==="
curl -s -X POST "$BASE/api/v1/fd/calculations/compare" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "principal": 100000.00,
           "options": [
             { "productCode": "FD001", "term": { "value": 12, "unit": "MONTHS" } },
             { "productCode": "FD001", "term": { "value": 24, "unit": "MONTHS" } }
           ]
         }' | jq .

# ─── 6. Retrieve a saved calculation ─────────────────────────────────────
CALC_ID="CALC-20260911-0001"
echo ""
echo "=== Retrieve Calculation ==="
curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE/api/v1/fd/calculations/$CALC_ID" | jq .

# ─── 7. Export as CSV ────────────────────────────────────────────────────
echo ""
echo "=== Export CSV ==="
curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE/api/v1/fd/calculations/$CALC_ID/export?format=csv"

# ─── 8. Explain a calculation ────────────────────────────────────────────
echo ""
echo "=== Explain Calculation ==="
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
     "$BASE/api/v1/fd/calculations/$CALC_ID/explain"

# ─── Error scenarios ─────────────────────────────────────────────────────

# 9. Missing JWT → 401
echo ""
echo "=== Missing JWT (expect 401) ==="
curl -s -X POST "$BASE/api/v1/fd/calculations" \
     -H "Content-Type: application/json" \
     -d '{"principal": 100000, "term": {"value": 12, "unit": "MONTHS"}, "productCode": "FD001"}' | jq .

# 10. Invalid principal → 400
echo ""
echo "=== Invalid Principal (expect 400) ==="
curl -s -X POST "$BASE/api/v1/fd/calculations" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"principal": -500, "term": {"value": 12, "unit": "MONTHS"}, "productCode": "FD001"}' | jq .

# 11. Inactive product → 422
echo ""
echo "=== Inactive Product (expect 422) ==="
curl -s -X POST "$BASE/api/v1/fd/calculations" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"principal": 100000, "term": {"value": 12, "unit": "MONTHS"}, "productCode": "INACTIVE001"}' | jq .

# 12. Swagger UI (browser)
echo ""
echo "=== Swagger UI ==="
echo "Open: $BASE/swagger-ui/index.html"
