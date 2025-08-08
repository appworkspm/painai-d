declare class APITester {
    private adminToken;
    private managerToken;
    private userToken;
    private testUsers;
    private testProjects;
    private testTimesheets;
    private testRoles;
    private testTasks;
    runAllTests(): Promise<void>;
    testAuthentication(): Promise<void>;
    testUserManagement(): Promise<void>;
    testRoleAndPermissionManagement(): Promise<void>;
    testProjectManagement(): Promise<void>;
    testTimesheetManagement(): Promise<void>;
    testReportsAndAnalytics(): Promise<void>;
    testSecurityAndEdgeCases(): Promise<void>;
}
declare function runAllTests(): Promise<void>;
export { APITester, runAllTests };
//# sourceMappingURL=test-all-apis.d.ts.map