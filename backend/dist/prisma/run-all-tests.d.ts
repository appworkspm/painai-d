declare class ComprehensiveTestRunner {
    private startTime;
    private endTime;
    runAllComprehensiveTests(): Promise<void>;
    runSpecificTestSuite(suiteName: string): Promise<void>;
    runQuickTest(): Promise<void>;
    runPerformanceTest(): Promise<void>;
    runSecurityTest(): Promise<void>;
}
declare function main(): Promise<void>;
export { ComprehensiveTestRunner, main };
//# sourceMappingURL=run-all-tests.d.ts.map