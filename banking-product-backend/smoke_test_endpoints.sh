#!/bin/bash

# Port number for the Spring Boot service
PORT=8080
BASE_URL="http://localhost:${PORT}/api/product"
AUTH_URL="http://localhost:${PORT}/api/auth/token"

echo "=========================================================="
echo "   BANKING PRODUCT & PRICING API END-TO-END SMOKE TESTS   "
echo "        (Labs L5: Products, L9: JWT, L13: FD Integration)  "
echo "=========================================================="

# 1. Acquire JWT Tokens for Testing
echo -e "\n1. Generating Admin and Bank Officer JWT tokens..."
ADMIN_TOKEN=$(curl -s -X POST "${AUTH_URL}" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_user","roles":["ADMIN"]}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

OFFICER_TOKEN=$(curl -s -X POST "${AUTH_URL}" \
  -H "Content-Type: application/json" \
  -d '{"username":"officer_user","roles":["BANK_OFFICER"]}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Admin Token Acquired: ${ADMIN_TOKEN:0:20}..."
echo "Officer Token Acquired: ${OFFICER_TOKEN:0:20}..."

# 2. Security Test: 401 Unauthorized (Missing Token)
echo -e "\n2. Security Check: Unauthenticated request (Expect 401)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "${BASE_URL}/search"

# 3. Security Test: 403 Forbidden (Bank Officer attempting to Create Product)
echo -e "\n3. Security Check: Bank Officer attempting Admin Create (Expect 403)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}" \
  -d '{"productCode":"FORBIDDEN01","productName":"Test","productType":"FD","currency":"INR","status":"ACTIVE"}'

# 4. Successful Create Product (Admin Role)
echo -e "\n4. Creating a new Fixed Deposit product FD201 as Admin (Expect 201)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "productCode": "FD201",
    "productName": "Fixed Deposit - Growth Yield",
    "productType": "FD",
    "currency": "INR",
    "effectiveDate": "2025-07-01",
    "status": "ACTIVE",
    "termLimit": { "min": 6, "max": 60 },
    "rateLimit": { "min": 5.5, "max": 8.0 },
    "interestType": "CREDIT",
    "minAge": 18,
    "minDeposit": 5000.0,
    "maxDeposit": 5000000.0,
    "charges": {
      "interestCreditFrequency": "QUARTERLY",
      "taxDeduction": true,
      "withdrawalFees": 1.0
    },
    "allowedRoles": ["OWNER", "CO_OWNER", "NOMINEE"],
    "rateVariations": [
      { "customerCategory": "SENIOR_CITIZEN", "rateModifier": 0.75 },
      { "customerCategory": "EMPLOYEE", "rateModifier": 0.50 }
    ]
  }'

# 5. Business Rule Check: 409 Conflict (Duplicate Product Code)
echo -e "\n5. Creating duplicate product FD201 (Expect 409 Conflict)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "productCode": "FD201",
    "productName": "Duplicate Growth FD",
    "productType": "FD",
    "currency": "INR",
    "status": "ACTIVE"
  }'

# 6. Validation Rule Check: 400 Bad Request (Missing Currency)
echo -e "\n6. Validation Failure: Missing currency (Expect 400 Bad Request)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "productCode": "SAV002",
    "productName": "Savings Account",
    "productType": "SAVINGS",
    "status": "ACTIVE"
  }'

# 7. Successful Update Product (Bank Officer Role)
echo -e "\n7. Updating product FD201 name and rate range as Bank Officer (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT "${BASE_URL}/FD201" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}" \
  -d '{
    "productCode": "FD201",
    "productName": "Fixed Deposit - Super Growth Yield",
    "productType": "FD",
    "currency": "INR",
    "status": "ACTIVE",
    "rateLimit": { "min": 5.75, "max": 8.25 }
  }'

# 8. Search Products with Filter and Pagination
echo -e "\n8. Searching products (productType=FD, page=0, size=10)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "${BASE_URL}/search?productType=FD&page=0&size=10" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}"

# 9. FD Module Integration: Validate Product for Account Creation
echo -e "\n9. [FD Integration] Validating FD201 criteria (term=12m, amt=50000, age=30) (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "${BASE_URL}/FD201/validate?termMonths=12&amount=50000&age=30" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}"

# 10. FD Module Integration: Calculate Final Interest Rate
echo -e "\n10. [FD Integration] Calculating final rate for Senior Citizen (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "${BASE_URL}/FD201/rate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}" \
  -d '{
    "termMonths": 12,
    "customerCategory": "SENIOR_CITIZEN",
    "age": 65
  }'

# 11. FD Module Integration: List Active Products
echo -e "\n11. [FD Integration] Listing active products for dropdown (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "${BASE_URL}/active?type=FD" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}"

# 12. FD Module Integration: Get Product Defaults
echo -e "\n12. [FD Integration] Fetching product defaults for account form auto-fill (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "${BASE_URL}/FD201/defaults" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}"

# 13. Observability: Actuator Health Check
echo -e "\n13. Observability: Actuator health check (Expect 200)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "http://localhost:${PORT}/actuator/health"

echo -e "\n=========================================================="
echo "               ALL SMOKE TESTS COMPLETED                  "
echo "=========================================================="
