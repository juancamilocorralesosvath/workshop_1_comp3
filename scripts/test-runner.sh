#!/bin/bash

# Test Runner Script for Gym Management API
# This script provides a convenient way to run different types of tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}=====================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required dependencies are installed
check_dependencies() {
    print_header "Checking Dependencies"

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Run this script from the project root."
        exit 1
    fi

    print_success "All dependencies are available"
}

# Install npm dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    npm ci
    print_success "Dependencies installed"
}

# Run linting
run_lint() {
    print_header "Running Linting"
    if npm run lint 2>/dev/null; then
        print_success "Linting passed"
    else
        print_warning "Linting found issues (continuing anyway)"
    fi
}

# Run type checking
run_typecheck() {
    print_header "Running Type Check"
    if npm run typecheck 2>/dev/null; then
        print_success "Type checking passed"
    else
        print_warning "Type checking found issues (continuing anyway)"
    fi
}

# Run unit tests
run_unit_tests() {
    print_header "Running Unit Tests"
    npm run test:unit
    print_success "Unit tests completed"
}

# Run integration tests
run_integration_tests() {
    print_header "Running Integration Tests"
    npm run test:integration
    print_success "Integration tests completed"
}

# Run all tests
run_all_tests() {
    print_header "Running All Tests"
    npm test
    print_success "All tests completed"
}

# Run tests with coverage
run_coverage() {
    print_header "Running Tests with Coverage"
    npm run test:coverage
    print_success "Coverage report generated"
    print_info "Open coverage/lcov-report/index.html to view detailed coverage"
}

# Watch mode
run_watch() {
    print_header "Running Tests in Watch Mode"
    print_info "Tests will re-run automatically when files change"
    print_info "Press Ctrl+C to exit"
    npm run test:watch
}

# Security audit
run_security_audit() {
    print_header "Running Security Audit"
    if npm audit --audit-level=moderate; then
        print_success "No security vulnerabilities found"
    else
        print_warning "Security vulnerabilities detected. Run 'npm audit fix' to attempt automatic fixes."
    fi
}

# Clean coverage and test artifacts
clean_artifacts() {
    print_header "Cleaning Test Artifacts"
    rm -rf coverage/
    rm -rf .nyc_output/
    rm -rf test-results/
    print_success "Test artifacts cleaned"
}

# Display help
show_help() {
    echo -e "${BLUE}Gym Management API Test Runner${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  all           Run all tests (unit + integration)"
    echo "  unit          Run unit tests only"
    echo "  integration   Run integration tests only"
    echo "  coverage      Run tests with coverage report"
    echo "  watch         Run tests in watch mode"
    echo "  lint          Run linting checks"
    echo "  typecheck     Run TypeScript type checking"
    echo "  security      Run security audit"
    echo "  clean         Clean test artifacts"
    echo "  ci            Run full CI pipeline (lint + typecheck + tests + coverage)"
    echo "  quick         Run quick tests (unit tests only, no coverage)"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                 # Run all tests"
    echo "  $0 unit                # Run only unit tests"
    echo "  $0 coverage            # Run tests with coverage"
    echo "  $0 watch               # Run tests in watch mode"
    echo "  $0 ci                  # Run full CI pipeline"
}

# CI pipeline
run_ci() {
    print_header "Running Full CI Pipeline"
    check_dependencies
    install_dependencies
    run_lint
    run_typecheck
    run_unit_tests
    run_integration_tests
    run_coverage
    run_security_audit
    print_success "CI pipeline completed successfully"
}

# Quick tests (unit only, no coverage)
run_quick() {
    print_header "Running Quick Tests"
    check_dependencies
    run_unit_tests
    print_success "Quick tests completed"
}

# Main script logic
case "${1:-help}" in
    "all")
        check_dependencies
        run_all_tests
        ;;
    "unit")
        check_dependencies
        run_unit_tests
        ;;
    "integration")
        check_dependencies
        run_integration_tests
        ;;
    "coverage")
        check_dependencies
        run_coverage
        ;;
    "watch")
        check_dependencies
        run_watch
        ;;
    "lint")
        check_dependencies
        run_lint
        ;;
    "typecheck")
        check_dependencies
        run_typecheck
        ;;
    "security")
        check_dependencies
        run_security_audit
        ;;
    "clean")
        clean_artifacts
        ;;
    "ci")
        run_ci
        ;;
    "quick")
        run_quick
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac