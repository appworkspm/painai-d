"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprehensiveTestRunner = void 0;
exports.main = main;
const test_all_apis_1 = require("./test-all-apis");
const test_roles_permissions_1 = require("./test-roles-permissions");
const test_reports_analytics_1 = require("./test-reports-analytics");
const test_security_performance_1 = require("./test-security-performance");
class ComprehensiveTestRunner {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
    }
    async runAllComprehensiveTests() {
        console.log('🚀 Starting Comprehensive API Testing Suite...\n');
        this.startTime = Date.now();
        try {
            console.log('='.repeat(60));
            console.log('📋 TEST SUITE 1: Main API Tests');
            console.log('='.repeat(60));
            await (0, test_all_apis_1.runAllTests)();
            console.log('\n' + '='.repeat(60));
            console.log('📋 TEST SUITE 2: Roles and Permissions Tests');
            console.log('='.repeat(60));
            await (0, test_roles_permissions_1.runRolesPermissionsTests)();
            console.log('\n' + '='.repeat(60));
            console.log('📋 TEST SUITE 3: Reports and Analytics Tests');
            console.log('='.repeat(60));
            await (0, test_reports_analytics_1.runReportsAnalyticsTests)();
            console.log('\n' + '='.repeat(60));
            console.log('📋 TEST SUITE 4: Security and Performance Tests');
            console.log('='.repeat(60));
            await (0, test_security_performance_1.runSecurityPerformanceTests)();
            this.endTime = Date.now();
            const totalTime = this.endTime - this.startTime;
            console.log('\n' + '='.repeat(60));
            console.log('🎉 COMPREHENSIVE TESTING COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(60));
            console.log(`⏱️ Total execution time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
            console.log('✅ All test suites passed');
            console.log('✅ API endpoints are working correctly');
            console.log('✅ Security measures are in place');
            console.log('✅ Performance is acceptable');
            console.log('✅ Data integrity is maintained');
            console.log('✅ RBAC is properly enforced');
            console.log('='.repeat(60));
        }
        catch (error) {
            this.endTime = Date.now();
            const totalTime = this.endTime - this.startTime;
            console.log('\n' + '='.repeat(60));
            console.log('❌ TESTING FAILED');
            console.log('='.repeat(60));
            console.log(`⏱️ Execution time before failure: ${totalTime}ms`);
            console.error('Error details:', error);
            console.log('='.repeat(60));
            throw error;
        }
    }
    async runSpecificTestSuite(suiteName) {
        console.log(`🚀 Running specific test suite: ${suiteName}\n`);
        switch (suiteName.toLowerCase()) {
            case 'main':
            case 'api':
            case 'all':
                await (0, test_all_apis_1.runAllTests)();
                break;
            case 'roles':
            case 'permissions':
            case 'rbac':
                await (0, test_roles_permissions_1.runRolesPermissionsTests)();
                break;
            case 'reports':
            case 'analytics':
                await (0, test_reports_analytics_1.runReportsAnalyticsTests)();
                break;
            case 'security':
            case 'performance':
                await (0, test_security_performance_1.runSecurityPerformanceTests)();
                break;
            default:
                console.log('❌ Unknown test suite. Available options:');
                console.log('  - main/api/all: Main API tests');
                console.log('  - roles/permissions/rbac: Roles and permissions tests');
                console.log('  - reports/analytics: Reports and analytics tests');
                console.log('  - security/performance: Security and performance tests');
                break;
        }
    }
    async runQuickTest() {
        console.log('🚀 Running Quick Test (Essential endpoints only)...\n');
        try {
            const tester = new test_all_apis_1.APITester();
            await tester.testAuthentication();
            await tester.testUserManagement();
            await tester.testTimesheetManagement();
            await tester.testSecurityAndEdgeCases();
            console.log('\n✅ Quick test completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Quick test failed:', error);
            throw error;
        }
    }
    async runPerformanceTest() {
        console.log('🚀 Running Performance Test...\n');
        try {
            const tester = new test_security_performance_1.SecurityPerformanceTester();
            await tester.login();
            await tester.testPerformance();
            await tester.testRateLimiting();
            console.log('\n✅ Performance test completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Performance test failed:', error);
            throw error;
        }
    }
    async runSecurityTest() {
        console.log('🚀 Running Security Test...\n');
        try {
            const tester = new test_security_performance_1.SecurityPerformanceTester();
            await tester.login();
            await tester.testAuthenticationSecurity();
            await tester.testAuthorizationSecurity();
            await tester.testInputValidation();
            await tester.testSQLInjectionPrevention();
            await tester.testXSSPrevention();
            console.log('\n✅ Security test completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Security test failed:', error);
            throw error;
        }
    }
}
exports.ComprehensiveTestRunner = ComprehensiveTestRunner;
async function main() {
    const args = process.argv.slice(2);
    const runner = new ComprehensiveTestRunner();
    if (args.length === 0) {
        await runner.runAllComprehensiveTests();
    }
    else {
        const command = args[0];
        switch (command) {
            case 'all':
                await runner.runAllComprehensiveTests();
                break;
            case 'quick':
                await runner.runQuickTest();
                break;
            case 'performance':
                await runner.runPerformanceTest();
                break;
            case 'security':
                await runner.runSecurityTest();
                break;
            case 'suite':
                if (args[1]) {
                    await runner.runSpecificTestSuite(args[1]);
                }
                else {
                    console.log('❌ Please specify a test suite name');
                    console.log('Available suites: main, roles, reports, security');
                }
                break;
            case 'help':
                console.log('Available commands:');
                console.log('  npm run test:all          - Run all comprehensive tests');
                console.log('  npm run test:quick        - Run quick essential tests');
                console.log('  npm run test:performance  - Run performance tests only');
                console.log('  npm run test:security     - Run security tests only');
                console.log('  npm run test:suite <name> - Run specific test suite');
                console.log('  npm run test:help         - Show this help message');
                console.log('');
                console.log('Available test suites:');
                console.log('  - main/api/all: Main API tests');
                console.log('  - roles/permissions/rbac: Roles and permissions tests');
                console.log('  - reports/analytics: Reports and analytics tests');
                console.log('  - security/performance: Security and performance tests');
                break;
            default:
                console.log('❌ Unknown command. Use "help" to see available commands.');
                break;
        }
    }
}
if (require.main === module) {
    main().catch((error) => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=run-all-tests.js.map