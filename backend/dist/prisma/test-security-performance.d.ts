declare class SecurityPerformanceTester {
    private adminToken;
    private managerToken;
    private userToken;
    runTests(): Promise<void>;
    login(): Promise<void>;
    testAuthenticationSecurity(): Promise<void>;
    testAuthorizationSecurity(): Promise<void>;
    testInputValidation(): Promise<void>;
    testSQLInjectionPrevention(): Promise<void>;
    testXSSPrevention(): Promise<void>;
    testRateLimiting(): Promise<void>;
    testPerformance(): Promise<void>;
    testErrorHandling(): Promise<void>;
    testDataIntegrity(): Promise<void>;
}
declare function runSecurityPerformanceTests(): Promise<void>;
export { SecurityPerformanceTester, runSecurityPerformanceTests };
//# sourceMappingURL=test-security-performance.d.ts.map