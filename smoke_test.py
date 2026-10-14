#!/usr/bin/env python3
"""
Comprehensive Smoke Test for all 3 Microservices
Tests all REST endpoints across:
1. FD Calculator Service (port 8084)
2. Product & Pricing Service (port 8080)
3. FD Account Service (port 8086)
4. Auth Service (port 8090)
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Tuple

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

# Service URLs
BASE_URLS = {
    'auth': 'http://localhost:8090',
    'product': 'http://localhost:8080',
    'calculator': 'http://localhost:8084',
    'account': 'http://localhost:8086'
}

# Test results
results = []
AUTH_TOKEN = None
# Use HTTP Basic auth (configured by default in fd-account-service)
BASIC_AUTH = ('admin1', 'admin123')

def log(message: str, color: str = BLUE):
    """Print colored message"""
    print(f"{color}{message}{RESET}")

def test_endpoint(name: str, method: str, url: str, 
                  expected_status: int = 200, 
                  headers: Dict = None, 
                  data: Dict = None,
                  params: Dict = None,
                  use_basic_auth: bool = False) -> bool:
    """Test a single endpoint"""
    try:
        full_url = url
        auth = BASIC_AUTH if use_basic_auth else None
        
        if method == 'GET':
            response = requests.get(full_url, headers=headers, params=params, auth=auth, timeout=10)
        elif method == 'POST':
            response = requests.post(full_url, headers=headers, json=data, params=params, auth=auth, timeout=10)
        elif method == 'PUT':
            response = requests.put(full_url, headers=headers, json=data, auth=auth, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(full_url, headers=headers, auth=auth, timeout=10)
        else:
            log(f"Invalid method: {method}", RED)
            return False
        
        success = response.status_code == expected_status
        status_icon = GREEN + "✓" if success else RED + "✗"
        log(f"{status_icon} {name} - {method} {url} - Status: {response.status_code}", 
            GREEN if success else RED)
        
        results.append({
            'name': name,
            'method': method,
            'url': url,
            'expected': expected_status,
            'actual': response.status_code,
            'success': success
        })
        
        return success
    except Exception as e:
        log(f"✗ {name} - {method} {url} - Error: {str(e)}", RED)
        results.append({
            'name': name,
            'method': method,
            'url': url,
            'expected': expected_status,
            'actual': 'ERROR',
            'success': False,
            'error': str(e)
        })
        return False

def test_auth_service():
    """Test Auth Service endpoints"""
    global AUTH_TOKEN
    log("\n=== Testing Auth Service (port 8090) ===", YELLOW)
    
    # Test login
    login_data = {
        "username": "admin1",
        "password": "admin123"
    }
    
    success = test_endpoint(
        "Login - Admin",
        "POST",
        f"{BASE_URLS['auth']}/api/auth/login",
        expected_status=200,
        data=login_data
    )
    
    if success:
        try:
            response = requests.post(f"{BASE_URLS['auth']}/api/auth/login", 
                                    json=login_data, timeout=10)
            AUTH_TOKEN = response.json().get('accessToken')
            log(f"  Auth Token obtained: {AUTH_TOKEN[:50]}..." if AUTH_TOKEN else "  Failed to get token", GREEN)
        except:
            log("  Failed to extract token", RED)
    
    # Test login with invalid credentials (should fail)
    test_endpoint(
        "Login - Invalid Credentials",
        "POST",
        f"{BASE_URLS['auth']}/api/auth/login",
        expected_status=401,
        data={"username": "invalid", "password": "invalid"}
    )

def get_auth_headers():
    """Get headers with auth token"""
    if AUTH_TOKEN:
        return {'Authorization': f'Bearer {AUTH_TOKEN}', 'Content-Type': 'application/json'}
    return {'Content-Type': 'application/json'}

def test_product_service():
    """Test Product & Pricing Service endpoints"""
    log("\n=== Testing Product & Pricing Service (port 8080) ===", YELLOW)
    
    headers = get_auth_headers()
    
    # Get active products
    test_endpoint(
        "Get Active Products",
        "GET",
        f"{BASE_URLS['product']}/api/v1/products/active",
        headers=headers
    )
    
    # Get active FD products
    test_endpoint(
        "Get Active FD Products",
        "GET",
        f"{BASE_URLS['product']}/api/v1/products/active?type=FD",
        headers=headers
    )
    
    # Search products
    test_endpoint(
        "Search Products",
        "GET",
        f"{BASE_URLS['product']}/api/v1/products/search?productType=FD",
        headers=headers
    )
    
    # Get product by code (assuming FD001 exists from init data)
    test_endpoint(
        "Get Product by Code",
        "GET",
        f"{BASE_URLS['product']}/api/v1/products/FD001",
        headers=headers,
        expected_status=200  # or 404 if not found
    )
    
    # Validate product
    test_endpoint(
        "Validate Product",
        "GET",
        f"{BASE_URLS['product']}/api/v1/products/FD001/validate?termMonths=12&amount=10000&age=30",
        headers=headers,
        expected_status=200  # or 404 if not found
    )
    
    # Get product defaults
    test_endpoint(
        "Get Product Defaults",
        "GET",
        f"{BASE_URLS['product']}/api/v1/products/FD001/defaults",
        headers=headers,
        expected_status=200  # or 404 if not found
    )
    
    # Calculate rate
    rate_data = {
        "termMonths": 12,
        "customerCategory": "REGULAR"
    }
    test_endpoint(
        "Calculate Rate",
        "POST",
        f"{BASE_URLS['product']}/api/v1/products/FD001/rate",
        headers=headers,
        data=rate_data,
        expected_status=200  # or 404 if not found
    )

def test_calculator_service():
    """Test FD Calculator Service endpoints"""
    log("\n=== Testing FD Calculator Service (port 8084) ===", YELLOW)
    
    headers = get_auth_headers()
    
    # Health check (actuator)
    test_endpoint(
        "Health Check",
        "GET",
        f"{BASE_URLS['calculator']}/actuator/health",
        expected_status=200
    )
    
    # Calculate FD maturity
    calc_data = {
        "principal": 10000,
        "termMonths": 12,
        "productCode": "FD001"
    }
    test_endpoint(
        "Calculate FD Maturity",
        "POST",
        f"{BASE_URLS['calculator']}/api/v1/fd/calculations",
        headers=headers,
        data=calc_data,
        expected_status=200  # or 404/422 if product not found
    )
    
    # Compare calculations
    compare_data = {
        "principal": 10000,
        "options": [
            {"productCode": "FD001", "termMonths": 12},
            {"productCode": "FD001", "termMonths": 24}
        ]
    }
    test_endpoint(
        "Compare Calculations",
        "POST",
        f"{BASE_URLS['calculator']}/api/v1/fd/calculations/compare",
        headers=headers,
        data=compare_data,
        expected_status=200  # or 404/422 if product not found
    )
    
    # Preview product
    test_endpoint(
        "Preview Product",
        "GET",
        f"{BASE_URLS['calculator']}/api/v1/fd/products/FD001/preview",
        headers=headers,
        expected_status=200  # or 404 if not found
    )
    
    # Custom calculation
    custom_calc_data = {
        "principal": 10000,
        "termMonths": 12,
        "annualRate": 7.5,
        "interestType": "COMPOUND",
        "compoundingFrequency": "QUARTERLY"
    }
    test_endpoint(
        "Custom Calculation",
        "POST",
        f"{BASE_URLS['calculator']}/api/v1/fd/calculations/custom",
        headers=headers,
        data=custom_calc_data
    )
    
    # Evict rate cache
    test_endpoint(
        "Evict Rate Cache",
        "POST",
        f"{BASE_URLS['calculator']}/api/v1/fd/cache/rates/evict",
        headers=headers
    )

def test_account_service():
    """Test FD Account Service endpoints"""
    log("\n=== Testing FD Account Service (port 8086) ===", YELLOW)
    
    headers = get_auth_headers()
    
    # Health check
    test_endpoint(
        "Health Check",
        "GET",
        f"{BASE_URLS['account']}/health",
        use_basic_auth=True,
        expected_status=200
    )
    
    # Get FD account (assuming one exists)
    test_endpoint(
        "Get FD Account",
        "GET",
        f"{BASE_URLS['account']}/api/fd/account/FD001",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 404 if not found
    )
    
    # Interest quote
    interest_data = {
        "principal": 10000,
        "annualRate": 7.5,
        "months": 12,
        "mode": "COMPOUND"
    }
    test_endpoint(
        "Interest Quote",
        "POST",
        f"{BASE_URLS['account']}/api/fd/interest/quote",
        headers=headers,
        data=interest_data,
        use_basic_auth=True
    )
    
    # Get interest accounts (admin only)
    test_endpoint(
        "Get Interest Accounts",
        "GET",
        f"{BASE_URLS['account']}/api/fd/interest/accounts",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 403 if not admin
    )
    
    # Clock status (admin only)
    test_endpoint(
        "Clock Status",
        "GET",
        f"{BASE_URLS['account']}/api/fd/clock",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 403 if not admin
    )
    
    # Integration - Get active products
    test_endpoint(
        "Integration - Get Active Products",
        "GET",
        f"{BASE_URLS['account']}/api/v1/integration/products/active",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 403/503
    )
    
    # Integration - Get product by code
    test_endpoint(
        "Integration - Get Product by Code",
        "GET",
        f"{BASE_URLS['account']}/api/v1/integration/products/FD001",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 404/403/503
    )
    
    # Integration - Validate product
    test_endpoint(
        "Integration - Validate Product",
        "GET",
        f"{BASE_URLS['account']}/api/v1/integration/products/FD001/validate?termMonths=12&amount=10000&age=30",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 404/403/503
    )
    
    # Reports - FD Summary
    test_endpoint(
        "Report - FD Summary",
        "GET",
        f"{BASE_URLS['account']}/api/report/fd-summary?status=ACTIVE",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 403 if not staff
    )
    
    # Reports - Customer Portfolio
    test_endpoint(
        "Report - Customer Portfolio",
        "GET",
        f"{BASE_URLS['account']}/api/report/customer-portfolio",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 403
    )
    
    # Reports - Maturity Summary
    test_endpoint(
        "Report - Maturity Summary",
        "GET",
        f"{BASE_URLS['account']}/api/report/maturity-summary?days=30",
        headers=headers,
        use_basic_auth=True,
        expected_status=200  # or 403 if not staff
    )

def print_summary():
    """Print test summary"""
    log("\n" + "="*60, YELLOW)
    log("SMOKE TEST SUMMARY", YELLOW)
    log("="*60, YELLOW)
    
    total = len(results)
    passed = sum(1 for r in results if r['success'])
    failed = total - passed
    
    log(f"Total Tests: {total}", BLUE)
    log(f"Passed: {GREEN}{passed}{RESET}", GREEN)
    log(f"Failed: {RED}{failed}{RESET}", RED if failed > 0 else GREEN)
    log(f"Success Rate: {(passed/total*100):.1f}%", BLUE)
    
    if failed > 0:
        log("\nFailed Tests:", RED)
        for r in results:
            if not r['success']:
                log(f"  - {r['name']} ({r['method']} {r['url']})", RED)
                if 'error' in r:
                    log(f"    Error: {r['error']}", RED)
    
    log("="*60, YELLOW)
    
    return failed == 0

def main():
    """Main test runner"""
    log(f"\nStarting Smoke Test at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", BLUE)
    log("Testing all 3 microservices + Auth Service\n", BLUE)
    
    # Test services in order
    test_auth_service()
    test_product_service()
    test_calculator_service()
    test_account_service()
    
    # Print summary
    success = print_summary()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
