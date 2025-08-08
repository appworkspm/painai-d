declare class RolesPermissionsTester {
    private adminToken;
    private managerToken;
    private userToken;
    private testRoles;
    private testPermissions;
    private testUserRoles;
    private testRolePermissions;
    runTests(): Promise<void>;
    login(): Promise<void>;
    testRolesCRUD(): Promise<void>;
    testPermissionsCRUD(): Promise<void>;
    testUserRoleAssignment(): Promise<void>;
    testRolePermissionAssignment(): Promise<void>;
    testPermissionEnforcement(): Promise<void>;
    testEdgeCases(): Promise<void>;
}
declare function runRolesPermissionsTests(): Promise<void>;
export { RolesPermissionsTester, runRolesPermissionsTests };
//# sourceMappingURL=test-roles-permissions.d.ts.map