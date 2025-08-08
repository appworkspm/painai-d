declare class ReportsAnalyticsTester {
    private adminToken;
    private managerToken;
    private userToken;
    private testProjects;
    private testTimesheets;
    runTests(): Promise<void>;
    login(): Promise<void>;
    setupTestData(): Promise<void>;
    testTimesheetReports(): Promise<void>;
    testProjectReports(): Promise<void>;
    testUserActivityReports(): Promise<void>;
    testWorkloadReports(): Promise<void>;
    testRBACForReports(): Promise<void>;
    testReportFilters(): Promise<void>;
    testEdgeCases(): Promise<void>;
}
declare function runReportsAnalyticsTests(): Promise<void>;
export { ReportsAnalyticsTester, runReportsAnalyticsTests };
//# sourceMappingURL=test-reports-analytics.d.ts.map