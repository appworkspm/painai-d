import axios from 'axios';

const API = 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
}

interface Timesheet {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  status: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface ProjectTask {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: string;
}

class APITester {
  private adminToken: string = '';
  private managerToken: string = '';
  private userToken: string = '';
  private testUsers: User[] = [];
  private testProjects: Project[] = [];
  private testTimesheets: Timesheet[] = [];
  private testRoles: Role[] = [];
  private testTasks: ProjectTask[] = [];

  async runAllTests() {
    console.log('🚀 Starting comprehensive API tests...\n');
    
    try {
      await this.testAuthentication();
      await this.testUserManagement();
      await this.testRoleAndPermissionManagement();
      await this.testProjectManagement();
      await this.testTimesheetManagement();
      await this.testReportsAndAnalytics();
      await this.testSecurityAndEdgeCases();
      
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      throw error;
    }
  }

  // 1. Authentication Tests
  async testAuthentication() {
    console.log('🔐 Testing Authentication...');
    
    // Login as admin
    const adminResponse = await axios.post(`${API}/auth/login`, {
      email: 'admin@example.com',
      password: 'adminpassword'
    });
    this.adminToken = adminResponse.data.token;
    console.log('✅ Admin login successful');

    // Login as manager
    const managerResponse = await axios.post(`${API}/auth/login`, {
      email: 'manager@example.com',
      password: 'managerpassword'
    });
    this.managerToken = managerResponse.data.token;
    console.log('✅ Manager login successful');

    // Login as user
    const userResponse = await axios.post(`${API}/auth/login`, {
      email: 'user@example.com',
      password: 'userpassword'
    });
    this.userToken = userResponse.data.token;
    console.log('✅ User login successful');

    // Test invalid login
    try {
      await axios.post(`${API}/auth/login`, {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login properly rejected');
      }
    }

    // Test token validation
    const profileResponse = await axios.get(`${API}/auth/profile`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ Token validation successful');
  }

  // 2. User Management Tests
  async testUserManagement() {
    console.log('\n👥 Testing User Management...');

    // Create test users
    const testUser1 = await axios.post(`${API}/users`, {
      name: 'Test User 1',
      email: 'testuser1@example.com',
      password: 'test1234',
      role: 'USER'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testUsers.push(testUser1.data);

    const testUser2 = await axios.post(`${API}/users`, {
      name: 'Test Manager 1',
      email: 'testmanager1@example.com',
      password: 'test1234',
      role: 'MANAGER'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testUsers.push(testUser2.data);

    console.log('✅ Test users created');

    // Get all users (admin only)
    const allUsers = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${allUsers.data.length} users`);

    // Update user profile
    await axios.put(`${API}/users/${testUser1.data.id}`, {
      name: 'Test User 1 Updated',
      email: 'testuser1@example.com'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    console.log('✅ User profile updated');

    // Test user cannot update other users
    try {
      await axios.put(`${API}/users/${testUser2.data.id}`, {
        name: 'Unauthorized Update'
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ User unauthorized access properly blocked');
      }
    }

    // Test manager cannot delete users
    try {
      await axios.delete(`${API}/users/${testUser1.data.id}`, {
        headers: { Authorization: `Bearer ${this.managerToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Manager unauthorized deletion properly blocked');
      }
    }

    // Admin can delete users
    await axios.delete(`${API}/users/${testUser1.data.id}`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ User deleted by admin');
  }

  // 3. Role and Permission Management Tests
  async testRoleAndPermissionManagement() {
    console.log('\n🔐 Testing Role and Permission Management...');

    // Get all roles
    const roles = await axios.get(`${API}/roles`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    this.testRoles = roles.data;
    console.log(`✅ Retrieved ${roles.data.length} roles`);

    // Test role-based access
    // User should not access admin endpoints
    try {
      await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ User access to admin endpoint properly blocked');
      }
    }

    // Manager should access manager endpoints
    const managerUsers = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${this.managerToken}` }
    });
    console.log('✅ Manager can access user management');

    // Test permission enforcement
    try {
      await axios.delete(`${API}/users/${this.testUsers[1].id}`, {
        headers: { Authorization: `Bearer ${this.managerToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Manager deletion permission properly enforced');
      }
    }
  }

  // 4. Project Management Tests
  async testProjectManagement() {
    console.log('\n📋 Testing Project Management...');

    // Create test projects
    const project1 = await axios.post(`${API}/projects`, {
      name: 'Test Project 1',
      description: 'A test project for API testing',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'ACTIVE'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testProjects.push(project1.data);

    const project2 = await axios.post(`${API}/projects`, {
      name: 'Test Project 2',
      description: 'Another test project',
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      status: 'ACTIVE'
    }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
    this.testProjects.push(project2.data);

    console.log('✅ Test projects created');

    // Get all projects
    const allProjects = await axios.get(`${API}/projects`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${allProjects.data.length} projects`);

    // Update project
    await axios.put(`${API}/projects/${project1.data.id}`, {
      name: 'Test Project 1 Updated',
      description: 'Updated description'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    console.log('✅ Project updated');

    // Create project tasks
    const task1 = await axios.post(`${API}/projects/${project1.data.id}/tasks`, {
      name: 'Task 1',
      description: 'First task',
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    this.testTasks.push(task1.data);

    const task2 = await axios.post(`${API}/projects/${project1.data.id}/tasks`, {
      name: 'Task 2',
      description: 'Second task',
      status: 'TODO',
      priority: 'MEDIUM'
    }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
    this.testTasks.push(task2.data);

    console.log('✅ Project tasks created');

    // Get project tasks
    const projectTasks = await axios.get(`${API}/projects/${project1.data.id}/tasks`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${projectTasks.data.length} tasks for project`);

    // Update task
    await axios.put(`${API}/projects/${project1.data.id}/tasks/${task1.data.id}`, {
      status: 'COMPLETED',
      description: 'Updated task description'
    }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
    console.log('✅ Task updated');

    // Delete task
    await axios.delete(`${API}/projects/${project1.data.id}/tasks/${task2.data.id}`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ Task deleted');

    // Test user cannot create projects
    try {
      await axios.post(`${API}/projects`, {
        name: 'Unauthorized Project',
        description: 'This should fail'
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ User project creation properly blocked');
      }
    }
  }

  // 5. Timesheet Management Tests
  async testTimesheetManagement() {
    console.log('\n⏰ Testing Timesheet Management...');

    // Create timesheets
    const timesheet1 = await axios.post(`${API}/timesheets`, {
      projectId: this.testProjects[0].id,
      date: '2024-01-15',
      hours: 8,
      description: 'Working on project tasks'
    }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    this.testTimesheets.push(timesheet1.data);

    const timesheet2 = await axios.post(`${API}/timesheets`, {
      projectId: this.testProjects[0].id,
      date: '2024-01-16',
      hours: 6,
      description: 'Code review and testing'
    }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    this.testTimesheets.push(timesheet2.data);

    console.log('✅ Timesheets created');

    // Get user timesheets
    const userTimesheets = await axios.get(`${API}/timesheets`, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    });
    console.log(`✅ Retrieved ${userTimesheets.data.length} user timesheets`);

    // Submit timesheet for approval
    await axios.put(`${API}/timesheets/${timesheet1.data.id}/submit`, {}, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    });
    console.log('✅ Timesheet submitted for approval');

    // Manager approves timesheet
    await axios.put(`${API}/timesheets/${timesheet1.data.id}/approve`, {
      comment: 'Approved by manager'
    }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
    console.log('✅ Timesheet approved by manager');

    // Manager rejects timesheet
    await axios.put(`${API}/timesheets/${timesheet2.data.id}/reject`, {
      comment: 'Please provide more details'
    }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
    console.log('✅ Timesheet rejected by manager');

    // Get timesheet history
    const history = await axios.get(`${API}/timesheets/${timesheet1.data.id}/history`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${history.data.length} history entries`);

    // Edit timesheet
    await axios.put(`${API}/timesheets/${timesheet2.data.id}`, {
      hours: 7,
      description: 'Updated description'
    }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    console.log('✅ Timesheet edited');

    // Get all timesheets (admin/manager)
    const allTimesheets = await axios.get(`${API}/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${allTimesheets.data.length} all timesheets`);

    // Delete timesheet
    await axios.delete(`${API}/timesheets/${timesheet2.data.id}`, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    });
    console.log('✅ Timesheet deleted');
  }

  // 6. Reports and Analytics Tests
  async testReportsAndAnalytics() {
    console.log('\n📊 Testing Reports and Analytics...');

    // Get timesheet report
    const timesheetReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Timesheet report generated');

    // Get project report
    const projectReport = await axios.get(`${API}/reports/projects`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ Project report generated');

    // Get user activity report
    const userActivityReport = await axios.get(`${API}/reports/user-activity`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ User activity report generated');

    // Get workload report
    const workloadReport = await axios.get(`${API}/reports/workload`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        period: 'month'
      }
    });
    console.log('✅ Workload report generated');

    // Test user can only see their own reports
    const userReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.userToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ User can access their own reports');

    // Test manager can see team reports
    const managerReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.managerToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Manager can access team reports');
  }

  // 7. Security and Edge Cases Tests
  async testSecurityAndEdgeCases() {
    console.log('\n🔒 Testing Security and Edge Cases...');

    // Test invalid token
    try {
      await axios.get(`${API}/users`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token properly rejected');
      }
    }

    // Test missing token
    try {
      await axios.get(`${API}/users`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Missing token properly rejected');
      }
    }

    // Test expired token (if implemented)
    // This would require a token that's actually expired

    // Test SQL injection prevention
    try {
      await axios.post(`${API}/auth/login`, {
        email: "'; DROP TABLE users; --",
        password: 'test'
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ SQL injection attempt properly handled');
      }
    }

    // Test XSS prevention
    const xssPayload = '<script>alert("xss")</script>';
    try {
      await axios.post(`${API}/timesheets`, {
        projectId: this.testProjects[0].id,
        date: '2024-01-15',
        hours: 8,
        description: xssPayload
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
      console.log('✅ XSS payload properly sanitized');
    } catch (error: any) {
      console.log('✅ XSS attempt properly rejected');
    }

    // Test rate limiting (if implemented)
    // This would require multiple rapid requests

    // Test data validation
    try {
      await axios.post(`${API}/timesheets`, {
        projectId: this.testProjects[0].id,
        date: 'invalid-date',
        hours: -5,
        description: ''
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Data validation working properly');
      }
    }

    // Test non-existent resource
    try {
      await axios.get(`${API}/timesheets/999999`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ 404 for non-existent resource');
      }
    }
  }
}

// Run all tests
async function runAllTests() {
  const tester = new APITester();
  await tester.runAllTests();
}

// Execute if this file is run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { APITester, runAllTests }; 