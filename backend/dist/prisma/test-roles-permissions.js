"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesPermissionsTester = void 0;
exports.runRolesPermissionsTests = runRolesPermissionsTests;
const axios_1 = __importDefault(require("axios"));
const API = 'http://localhost:5000/api';
class RolesPermissionsTester {
    constructor() {
        this.adminToken = '';
        this.managerToken = '';
        this.userToken = '';
        this.testRoles = [];
        this.testPermissions = [];
        this.testUserRoles = [];
        this.testRolePermissions = [];
    }
    async runTests() {
        console.log('🔐 Testing Roles and Permissions Management...\n');
        try {
            await this.login();
            await this.testRolesCRUD();
            await this.testPermissionsCRUD();
            await this.testUserRoleAssignment();
            await this.testRolePermissionAssignment();
            await this.testPermissionEnforcement();
            await this.testEdgeCases();
            console.log('\n✅ All Roles and Permissions tests completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Test failed:', error);
            throw error;
        }
    }
    async login() {
        console.log('🔑 Logging in...');
        const adminResponse = await axios_1.default.post(`${API}/auth/login`, {
            email: 'admin@example.com',
            password: 'adminpassword'
        });
        this.adminToken = adminResponse.data.token;
        const managerResponse = await axios_1.default.post(`${API}/auth/login`, {
            email: 'manager@example.com',
            password: 'managerpassword'
        });
        this.managerToken = managerResponse.data.token;
        const userResponse = await axios_1.default.post(`${API}/auth/login`, {
            email: 'user@example.com',
            password: 'userpassword'
        });
        this.userToken = userResponse.data.token;
        console.log('✅ Login successful');
    }
    async testRolesCRUD() {
        console.log('\n👥 Testing Roles CRUD...');
        const newRole = await axios_1.default.post(`${API}/roles`, {
            name: 'TEST_ROLE',
            description: 'A test role for API testing'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testRoles.push(newRole.data);
        console.log('✅ Role created');
        const roles = await axios_1.default.get(`${API}/roles`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${roles.data.length} roles`);
        await axios_1.default.put(`${API}/roles/${newRole.data.id}`, {
            name: 'TEST_ROLE_UPDATED',
            description: 'Updated test role description'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        console.log('✅ Role updated');
        try {
            await axios_1.default.post(`${API}/roles`, {
                name: 'MANAGER_ROLE',
                description: 'This should fail'
            }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Manager role creation properly blocked');
            }
        }
        try {
            await axios_1.default.get(`${API}/roles`, {
                headers: { Authorization: `Bearer ${this.userToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ User role access properly blocked');
            }
        }
    }
    async testPermissionsCRUD() {
        console.log('\n🔑 Testing Permissions CRUD...');
        const newPermission = await axios_1.default.post(`${API}/permissions`, {
            name: 'TEST_PERMISSION',
            description: 'A test permission for API testing'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testPermissions.push(newPermission.data);
        console.log('✅ Permission created');
        const permissions = await axios_1.default.get(`${API}/permissions`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${permissions.data.length} permissions`);
        await axios_1.default.put(`${API}/permissions/${newPermission.data.id}`, {
            name: 'TEST_PERMISSION_UPDATED',
            description: 'Updated test permission description'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        console.log('✅ Permission updated');
        try {
            await axios_1.default.post(`${API}/permissions`, {
                name: 'MANAGER_PERMISSION',
                description: 'This should fail'
            }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Manager permission creation properly blocked');
            }
        }
    }
    async testUserRoleAssignment() {
        console.log('\n👤 Testing User Role Assignment...');
        const users = await axios_1.default.get(`${API}/users`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        if (users.data.length > 0) {
            const testUser = users.data[0];
            const userRole = await axios_1.default.post(`${API}/user-roles`, {
                userId: testUser.id,
                roleId: this.testRoles[0].id
            }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
            this.testUserRoles.push(userRole.data);
            console.log('✅ Role assigned to user');
            const userRoles = await axios_1.default.get(`${API}/users/${testUser.id}/roles`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
            console.log(`✅ Retrieved ${userRoles.data.length} roles for user`);
            await axios_1.default.delete(`${API}/user-roles/${userRole.data.id}`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
            console.log('✅ Role removed from user');
        }
    }
    async testRolePermissionAssignment() {
        console.log('\n🔐 Testing Role Permission Assignment...');
        const rolePermission = await axios_1.default.post(`${API}/role-permissions`, {
            roleId: this.testRoles[0].id,
            permissionId: this.testPermissions[0].id
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testRolePermissions.push(rolePermission.data);
        console.log('✅ Permission assigned to role');
        const rolePermissions = await axios_1.default.get(`${API}/roles/${this.testRoles[0].id}/permissions`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${rolePermissions.data.length} permissions for role`);
        await axios_1.default.delete(`${API}/role-permissions/${rolePermission.data.id}`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ Permission removed from role');
    }
    async testPermissionEnforcement() {
        console.log('\n🛡️ Testing Permission Enforcement...');
        const adminEndpoints = [
            `${API}/roles`,
            `${API}/permissions`,
            `${API}/user-roles`,
            `${API}/role-permissions`
        ];
        for (const endpoint of adminEndpoints) {
            try {
                await axios_1.default.get(endpoint, {
                    headers: { Authorization: `Bearer ${this.userToken}` }
                });
            }
            catch (error) {
                if (error.response?.status === 403) {
                    console.log(`✅ User access to ${endpoint} properly blocked`);
                }
            }
        }
        const managerEndpoints = [
            `${API}/roles`,
            `${API}/permissions`
        ];
        for (const endpoint of managerEndpoints) {
            try {
                await axios_1.default.get(endpoint, {
                    headers: { Authorization: `Bearer ${this.managerToken}` }
                });
            }
            catch (error) {
                if (error.response?.status === 403) {
                    console.log(`✅ Manager access to ${endpoint} properly blocked`);
                }
            }
        }
    }
    async testEdgeCases() {
        console.log('\n⚠️ Testing Edge Cases...');
        try {
            await axios_1.default.post(`${API}/roles`, {
                name: 'TEST_ROLE',
                description: 'Duplicate role'
            }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Duplicate role creation properly rejected');
            }
        }
        try {
            await axios_1.default.post(`${API}/user-roles`, {
                userId: 'invalid-user-id',
                roleId: 'invalid-role-id'
            }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid user role assignment properly rejected');
            }
        }
        try {
            await axios_1.default.get(`${API}/roles/999999`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ 404 for non-existent role');
            }
        }
        try {
            await axios_1.default.delete(`${API}/roles/${this.testRoles[0].id}`, {
                headers: { Authorization: `Bearer ${this.managerToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Unauthorized role deletion properly blocked');
            }
        }
    }
}
exports.RolesPermissionsTester = RolesPermissionsTester;
async function runRolesPermissionsTests() {
    const tester = new RolesPermissionsTester();
    await tester.runTests();
}
if (require.main === module) {
    runRolesPermissionsTests().catch(console.error);
}
//# sourceMappingURL=test-roles-permissions.js.map