#!/bin/bash

# Port number for the Spring Boot service
PORT=8084
BASE_URL="http://localhost:${PORT}/api/v1/fd"
AUTH_URL="http://localhost:${PORT}/api/auth/token"

echo "=========================================================="
echo "   FD CALCULATOR API END-TO-END SMOKE TESTS   "
echo "=========================================================="

# 1. Acquire JWT Tokens for Testing
echo -e "\n1. Using pre-generated Customer JWT token..."
CUSTOMER_TOKEN="eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAiY3VzdG9tZXJfdXNlciIsICJyb2xlcyI6IFsiQ1VTVE9NRVIiXSwgImlzcyI6ICJodHRwOi8vbG9jYWxob3N0OjgwODEiLCAiYXVkIjogImZkLWNhbGN1bGF0b3Itc2VydmljZSIsICJleHAiOiAxNzkxOTc1NjQ2fQ.MLkJi7euCkqWbBQ4KSSX3EBA9EQCL05uA1eEuicGrI8"

echo "Customer Token Acquired: ${CUSTOMER_TOKEN:0:20}..."

# 2. Health Check (No auth required)
echo -e "\n2. Health Check (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "http://localhost:${PORT}/actuator/health"

# 3. Security Test: 401 Unauthorized (Missing Token)
echo -e "\n3. Security Check: Unauthenticated request (Expect 401)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations" \
  -H "Content-Type: application/json" \
  -d '{"principal": 100000, "term": {"value": 12, "unit": "MONTHS"}, "productCode": "FD001"}'

# 4. Product Preview (Valid request)
echo -e "\n4. Product Preview for FD001 (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "${BASE_URL}/products/FD001/preview" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}"

# 5. Calculate Maturity - 12 months (Valid request)
echo -e "\n5. Calculate Maturity - 12 months (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000.00,
    "term": { "value": 12, "unit": "MONTHS" },
    "productCode": "FD001",
    "payoutMode": "CUMULATIVE"
  }'

# 6. Calculate Maturity - 2 years (Valid request)
echo -e "\n6. Calculate Maturity - 2 years (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 500000.00,
    "term": { "value": 2, "unit": "YEARS" },
    "productCode": "FD001",
    "payoutMode": "CUMULATIVE"
  }'

# 7. Compare Products (Valid request)
echo -e "\n7. Compare Products (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations/compare" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000.00,
    "options": [
      { "productCode": "FD001", "term": { "value": 12, "unit": "MONTHS" } },
      { "productCode": "FD001", "term": { "value": 24, "unit": "MONTHS" } }
    ]
  }'

# 8. Validation Error: Invalid Principal (Expect 400)
echo -e "\n8. Validation Error: Invalid Principal (Expect 400)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"principal": -500, "term": {"value": 12, "unit": "MONTHS"}, "productCode": "FD001"}'

# 9. Business Rule Error: Inactive Product (Expect 422)
echo -e "\n9. Business Rule Error: Inactive Product (Expect 422)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"principal": 100000, "term": {"value": 12, "unit": "MONTHS"}, "productCode": "INACTIVE001"}'

# 10. Custom FD Calculation - Compound Interest (Expect 200)
echo -e "\n10. Custom FD Calculation - Compound Interest (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations/custom" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000.00,
    "term": { "value": 24, "unit": "MONTHS" },
    "interestRate": 8.5,
    "interestType": "COMPOUND",
    "compoundingFrequency": "QUARTERLY",
    "payoutMode": "CUMULATIVE"
  }'

# 11. Custom FD Calculation - Simple Interest (Expect 200)
echo -e "\n11. Custom FD Calculation - Simple Interest (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations/custom" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 50000.00,
    "term": { "value": 1, "unit": "YEARS" },
    "interestRate": 7.0,
    "interestType": "SIMPLE",
    "payoutMode": "CUMULATIVE"
  }'

# 12. Custom FD Calculation - CREDIT Interest Type (Expect 200)
echo -e "\n12. Custom FD Calculation - CREDIT Interest Type (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/calculations/custom" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 200000.00,
    "term": { "value": 36, "unit": "MONTHS" },
    "interestRate": 6.5,
    "interestType": "CREDIT",
    "payoutMode": "CUMULATIVE"
  }'

echo -e "\n=========================================================="
echo "               ALL SMOKE TESTS COMPLETED                  "
echo "=========================================================="
