import axios from 'axios';

const API = 'http://localhost:5000/api';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
}

interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}

class RolesPermissionsTester {
  private adminToken: string = '';
  private managerToken: string = '';
  private userToken: string = '';
  private testRoles: Role[] = [];
  private testPermissions: Permission[] = [];
  private testUserRoles: UserRole[] = [];
  private testRolePermissions: RolePermission[] = [];

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
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      throw error;
    }
  }

  async login() {
    console.log('🔑 Logging in...');
    
    const adminResponse = await axios.post(`${API}/auth/login`, {
      email: 'admin@example.com',
      password: 'adminpassword'
    });
    this.adminToken = adminResponse.data.token;

    const managerResponse = await axios.post(`${API}/auth/login`, {
      email: 'manager@example.com',
      password: 'managerpassword'
    });
    this.managerToken = managerResponse.data.token;

    const userResponse = await axios.post(`${API}/auth/login`, {
      email: 'user@example.com',
      password: 'userpassword'
    });
    this.userToken = userResponse.data.token;

    console.log('✅ Login successful');
  }

  async testRolesCRUD() {
    console.log('\n👥 Testing Roles CRUD...');

    // Create new role
    const newRole = await axios.post(`${API}/roles`, {
      name: 'TEST_ROLE',
      description: 'A test role for API testing'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testRoles.push(newRole.data);
    console.log('✅ Role created');

    // Get all roles
    const roles = await axios.get(`${API}/roles`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${roles.data.length} roles`);

    // Update role
    await axios.put(`${API}/roles/${newRole.data.id}`, {
      name: 'TEST_ROLE_UPDATED',
      description: 'Updated test role description'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    console.log('✅ Role updated');

    // Test manager cannot create roles
    try {
      await axios.post(`${API}/roles`, {
        name: 'MANAGER_ROLE',
        description: 'This should fail'
      }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Manager role creation properly blocked');
      }
    }

    // Test user cannot access roles
    try {
      await axios.get(`${API}/roles`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ User role access properly blocked');
      }
    }
  }

  async testPermissionsCRUD() {
    console.log('\n🔑 Testing Permissions CRUD...');

    // Create new permission
    const newPermission = await axios.post(`${API}/permissions`, {
      name: 'TEST_PERMISSION',
      description: 'A test permission for API testing'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testPermissions.push(newPermission.data);
    console.log('✅ Permission created');

    // Get all permissions
    const permissions = await axios.get(`${API}/permissions`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${permissions.data.length} permissions`);

    // Update permission
    await axios.put(`${API}/permissions/${newPermission.data.id}`, {
      name: 'TEST_PERMISSION_UPDATED',
      description: 'Updated test permission description'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    console.log('✅ Permission updated');

    // Test manager cannot create permissions
    try {
      await axios.post(`${API}/permissions`, {
        name: 'MANAGER_PERMISSION',
        description: 'This should fail'
      }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Manager permission creation properly blocked');
      }
    }
  }

  async testUserRoleAssignment() {
    console.log('\n👤 Testing User Role Assignment...');

    // Get existing users
    const users = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (users.data.length > 0) {
      const testUser = users.data[0];

      // Assign role to user
      const userRole = await axios.post(`${API}/user-roles`, {
        userId: testUser.id,
        roleId: this.testRoles[0].id
      }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
      this.testUserRoles.push(userRole.data);
      console.log('✅ Role assigned to user');

      // Get user roles
      const userRoles = await axios.get(`${API}/users/${testUser.id}/roles`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      console.log(`✅ Retrieved ${userRoles.data.length} roles for user`);

      // Remove role from user
      await axios.delete(`${API}/user-roles/${userRole.data.id}`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      console.log('✅ Role removed from user');
    }
  }

  async testRolePermissionAssignment() {
    console.log('\n🔐 Testing Role Permission Assignment...');

    // Assign permission to role
    const rolePermission = await axios.post(`${API}/role-permissions`, {
      roleId: this.testRoles[0].id,
      permissionId: this.testPermissions[0].id
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testRolePermissions.push(rolePermission.data);
    console.log('✅ Permission assigned to role');

    // Get role permissions
    const rolePermissions = await axios.get(`${API}/roles/${this.testRoles[0].id}/permissions`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${rolePermissions.data.length} permissions for role`);

    // Remove permission from role
    await axios.delete(`${API}/role-permissions/${rolePermission.data.id}`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ Permission removed from role');
  }

  async testPermissionEnforcement() {
    console.log('\n🛡️ Testing Permission Enforcement...');

    // Test that users cannot access admin endpoints
    const adminEndpoints = [
      `${API}/roles`,
      `${API}/permissions`,
      `${API}/user-roles`,
      `${API}/role-permissions`
    ];

    for (const endpoint of adminEndpoints) {
      try {
        await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${this.userToken}` }
        });
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.log(`✅ User access to ${endpoint} properly blocked`);
        }
      }
    }

    // Test that managers cannot access role/permission management
    const managerEndpoints = [
      `${API}/roles`,
      `${API}/permissions`
    ];

    for (const endpoint of managerEndpoints) {
      try {
        await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${this.managerToken}` }
        });
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.log(`✅ Manager access to ${endpoint} properly blocked`);
        }
      }
    }
  }

  async testEdgeCases() {
    console.log('\n⚠️ Testing Edge Cases...');

    // Test duplicate role creation
    try {
      await axios.post(`${API}/roles`, {
        name: 'TEST_ROLE',
        description: 'Duplicate role'
      }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate role creation properly rejected');
      }
    }

    // Test invalid role assignment
    try {
      await axios.post(`${API}/user-roles`, {
        userId: 'invalid-user-id',
        roleId: 'invalid-role-id'
      }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid user role assignment properly rejected');
      }
    }

    // Test non-existent resource
    try {
      await axios.get(`${API}/roles/999999`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ 404 for non-existent role');
      }
    }

    // Test unauthorized deletion
    try {
      await axios.delete(`${API}/roles/${this.testRoles[0].id}`, {
        headers: { Authorization: `Bearer ${this.managerToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Unauthorized role deletion properly blocked');
      }
    }
  }
}

// Run tests
async function runRolesPermissionsTests() {
  const tester = new RolesPermissionsTester();
  await tester.runTests();
}

// Execute if this file is run directly
if (require.main === module) {
  runRolesPermissionsTests().catch(console.error);
}

export { RolesPermissionsTester, runRolesPermissionsTests }; 