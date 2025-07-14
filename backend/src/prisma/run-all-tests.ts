import { APITester, runAllTests } from './test-all-apis';
import { RolesPermissionsTester, runRolesPermissionsTests } from './test-roles-permissions';
import { ReportsAnalyticsTester, runReportsAnalyticsTests } from './test-reports-analytics';
import { SecurityPerformanceTester, runSecurityPerformanceTests } from './test-security-performance';

class ComprehensiveTestRunner {
  private startTime: number = 0;
  private endTime: number = 0;

  async runAllComprehensiveTests() {
    console.log('🚀 Starting Comprehensive API Testing Suite...\n');
    this.startTime = Date.now();

    try {
      // 1. Main API Tests (Authentication, Users, Projects, Timesheets, Reports, Security)
      console.log('='.repeat(60));
      console.log('📋 TEST SUITE 1: Main API Tests');
      console.log('='.repeat(60));
      await runAllTests();

      // 2. Roles and Permissions Tests
      console.log('\n' + '='.repeat(60));
      console.log('📋 TEST SUITE 2: Roles and Permissions Tests');
      console.log('='.repeat(60));
      await runRolesPermissionsTests();

      // 3. Reports and Analytics Tests
      console.log('\n' + '='.repeat(60));
      console.log('📋 TEST SUITE 3: Reports and Analytics Tests');
      console.log('='.repeat(60));
      await runReportsAnalyticsTests();

      // 4. Security and Performance Tests
      console.log('\n' + '='.repeat(60));
      console.log('📋 TEST SUITE 4: Security and Performance Tests');
      console.log('='.repeat(60));
      await runSecurityPerformanceTests();

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

    } catch (error) {
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

  async runSpecificTestSuite(suiteName: string) {
    console.log(`🚀 Running specific test suite: ${suiteName}\n`);

    switch (suiteName.toLowerCase()) {
      case 'main':
      case 'api':
      case 'all':
        await runAllTests();
        break;
      
      case 'roles':
      case 'permissions':
      case 'rbac':
        await runRolesPermissionsTests();
        break;
      
      case 'reports':
      case 'analytics':
        await runReportsAnalyticsTests();
        break;
      
      case 'security':
      case 'performance':
        await runSecurityPerformanceTests();
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
      const tester = new APITester();
      
      // Run only essential tests
      await tester.testAuthentication();
      await tester.testUserManagement();
      await tester.testTimesheetManagement();
      await tester.testSecurityAndEdgeCases();
      
      console.log('\n✅ Quick test completed successfully!');
    } catch (error) {
      console.error('\n❌ Quick test failed:', error);
      throw error;
    }
  }

  async runPerformanceTest() {
    console.log('🚀 Running Performance Test...\n');
    
    try {
      const tester = new SecurityPerformanceTester();
      
      // Run only performance-related tests
      await tester.login();
      await tester.testPerformance();
      await tester.testRateLimiting();
      
      console.log('\n✅ Performance test completed successfully!');
    } catch (error) {
      console.error('\n❌ Performance test failed:', error);
      throw error;
    }
  }

  async runSecurityTest() {
    console.log('🚀 Running Security Test...\n');
    
    try {
      const tester = new SecurityPerformanceTester();
      
      // Run only security-related tests
      await tester.login();
      await tester.testAuthenticationSecurity();
      await tester.testAuthorizationSecurity();
      await tester.testInputValidation();
      await tester.testSQLInjectionPrevention();
      await tester.testXSSPrevention();
      
      console.log('\n✅ Security test completed successfully!');
    } catch (error) {
      console.error('\n❌ Security test failed:', error);
      throw error;
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new ComprehensiveTestRunner();

  if (args.length === 0) {
    // Run all tests by default
    await runner.runAllComprehensiveTests();
  } else {
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
        } else {
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

// Execute if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { ComprehensiveTestRunner, main }; 