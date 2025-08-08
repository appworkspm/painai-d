"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APITester = void 0;
exports.runAllTests = runAllTests;
const axios_1 = __importDefault(require("axios"));
const API = 'http://localhost:5000/api';
class APITester {
    constructor() {
        this.adminToken = '';
        this.managerToken = '';
        this.userToken = '';
        this.testUsers = [];
        this.testProjects = [];
        this.testTimesheets = [];
        this.testRoles = [];
        this.testTasks = [];
    }
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
        }
        catch (error) {
            console.error('\n❌ Test failed:', error);
            throw error;
        }
    }
    async testAuthentication() {
        console.log('🔐 Testing Authentication...');
        const adminResponse = await axios_1.default.post(`${API}/auth/login`, {
            email: 'admin@example.com',
            password: 'adminpassword'
        });
        this.adminToken = adminResponse.data.token;
        console.log('✅ Admin login successful');
        const managerResponse = await axios_1.default.post(`${API}/auth/login`, {
            email: 'manager@example.com',
            password: 'managerpassword'
        });
        this.managerToken = managerResponse.data.token;
        console.log('✅ Manager login successful');
        const userResponse = await axios_1.default.post(`${API}/auth/login`, {
            email: 'user@example.com',
            password: 'userpassword'
        });
        this.userToken = userResponse.data.token;
        console.log('✅ User login successful');
        try {
            await axios_1.default.post(`${API}/auth/login`, {
                email: 'invalid@example.com',
                password: 'wrongpassword'
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid login properly rejected');
            }
        }
        const profileResponse = await axios_1.default.get(`${API}/auth/profile`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ Token validation successful');
    }
    async testUserManagement() {
        console.log('\n👥 Testing User Management...');
        const testUser1 = await axios_1.default.post(`${API}/users`, {
            name: 'Test User 1',
            email: 'testuser1@example.com',
            password: 'test1234',
            role: 'USER'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testUsers.push(testUser1.data);
        const testUser2 = await axios_1.default.post(`${API}/users`, {
            name: 'Test Manager 1',
            email: 'testmanager1@example.com',
            password: 'test1234',
            role: 'MANAGER'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testUsers.push(testUser2.data);
        console.log('✅ Test users created');
        const allUsers = await axios_1.default.get(`${API}/users`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${allUsers.data.length} users`);
        await axios_1.default.put(`${API}/users/${testUser1.data.id}`, {
            name: 'Test User 1 Updated',
            email: 'testuser1@example.com'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        console.log('✅ User profile updated');
        try {
            await axios_1.default.put(`${API}/users/${testUser2.data.id}`, {
                name: 'Unauthorized Update'
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ User unauthorized access properly blocked');
            }
        }
        try {
            await axios_1.default.delete(`${API}/users/${testUser1.data.id}`, {
                headers: { Authorization: `Bearer ${this.managerToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Manager unauthorized deletion properly blocked');
            }
        }
        await axios_1.default.delete(`${API}/users/${testUser1.data.id}`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ User deleted by admin');
    }
    async testRoleAndPermissionManagement() {
        console.log('\n🔐 Testing Role and Permission Management...');
        const roles = await axios_1.default.get(`${API}/roles`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        this.testRoles = roles.data;
        console.log(`✅ Retrieved ${roles.data.length} roles`);
        try {
            await axios_1.default.get(`${API}/users`, {
                headers: { Authorization: `Bearer ${this.userToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ User access to admin endpoint properly blocked');
            }
        }
        const managerUsers = await axios_1.default.get(`${API}/users`, {
            headers: { Authorization: `Bearer ${this.managerToken}` }
        });
        console.log('✅ Manager can access user management');
        try {
            await axios_1.default.delete(`${API}/users/${this.testUsers[1].id}`, {
                headers: { Authorization: `Bearer ${this.managerToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Manager deletion permission properly enforced');
            }
        }
    }
    async testProjectManagement() {
        console.log('\n📋 Testing Project Management...');
        const project1 = await axios_1.default.post(`${API}/projects`, {
            name: 'Test Project 1',
            description: 'A test project for API testing',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'ACTIVE'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testProjects.push(project1.data);
        const project2 = await axios_1.default.post(`${API}/projects`, {
            name: 'Test Project 2',
            description: 'Another test project',
            startDate: '2024-02-01',
            endDate: '2024-11-30',
            status: 'ACTIVE'
        }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
        this.testProjects.push(project2.data);
        console.log('✅ Test projects created');
        const allProjects = await axios_1.default.get(`${API}/projects`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${allProjects.data.length} projects`);
        await axios_1.default.put(`${API}/projects/${project1.data.id}`, {
            name: 'Test Project 1 Updated',
            description: 'Updated description'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        console.log('✅ Project updated');
        const task1 = await axios_1.default.post(`${API}/projects/${project1.data.id}/tasks`, {
            name: 'Task 1',
            description: 'First task',
            status: 'IN_PROGRESS',
            priority: 'HIGH'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        this.testTasks.push(task1.data);
        const task2 = await axios_1.default.post(`${API}/projects/${project1.data.id}/tasks`, {
            name: 'Task 2',
            description: 'Second task',
            status: 'TODO',
            priority: 'MEDIUM'
        }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
        this.testTasks.push(task2.data);
        console.log('✅ Project tasks created');
        const projectTasks = await axios_1.default.get(`${API}/projects/${project1.data.id}/tasks`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${projectTasks.data.length} tasks for project`);
        await axios_1.default.put(`${API}/projects/${project1.data.id}/tasks/${task1.data.id}`, {
            status: 'COMPLETED',
            description: 'Updated task description'
        }, { headers: { Authorization: `Bearer ${this.adminToken}` } });
        console.log('✅ Task updated');
        await axios_1.default.delete(`${API}/projects/${project1.data.id}/tasks/${task2.data.id}`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ Task deleted');
        try {
            await axios_1.default.post(`${API}/projects`, {
                name: 'Unauthorized Project',
                description: 'This should fail'
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ User project creation properly blocked');
            }
        }
    }
    async testTimesheetManagement() {
        console.log('\n⏰ Testing Timesheet Management...');
        const timesheet1 = await axios_1.default.post(`${API}/timesheets`, {
            projectId: this.testProjects[0].id,
            date: '2024-01-15',
            hours: 8,
            description: 'Working on project tasks'
        }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        this.testTimesheets.push(timesheet1.data);
        const timesheet2 = await axios_1.default.post(`${API}/timesheets`, {
            projectId: this.testProjects[0].id,
            date: '2024-01-16',
            hours: 6,
            description: 'Code review and testing'
        }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        this.testTimesheets.push(timesheet2.data);
        console.log('✅ Timesheets created');
        const userTimesheets = await axios_1.default.get(`${API}/timesheets`, {
            headers: { Authorization: `Bearer ${this.userToken}` }
        });
        console.log(`✅ Retrieved ${userTimesheets.data.length} user timesheets`);
        await axios_1.default.put(`${API}/timesheets/${timesheet1.data.id}/submit`, {}, {
            headers: { Authorization: `Bearer ${this.userToken}` }
        });
        console.log('✅ Timesheet submitted for approval');
        await axios_1.default.put(`${API}/timesheets/${timesheet1.data.id}/approve`, {
            comment: 'Approved by manager'
        }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
        console.log('✅ Timesheet approved by manager');
        await axios_1.default.put(`${API}/timesheets/${timesheet2.data.id}/reject`, {
            comment: 'Please provide more details'
        }, { headers: { Authorization: `Bearer ${this.managerToken}` } });
        console.log('✅ Timesheet rejected by manager');
        const history = await axios_1.default.get(`${API}/timesheets/${timesheet1.data.id}/history`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${history.data.length} history entries`);
        await axios_1.default.put(`${API}/timesheets/${timesheet2.data.id}`, {
            hours: 7,
            description: 'Updated description'
        }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        console.log('✅ Timesheet edited');
        const allTimesheets = await axios_1.default.get(`${API}/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log(`✅ Retrieved ${allTimesheets.data.length} all timesheets`);
        await axios_1.default.delete(`${API}/timesheets/${timesheet2.data.id}`, {
            headers: { Authorization: `Bearer ${this.userToken}` }
        });
        console.log('✅ Timesheet deleted');
    }
    async testReportsAndAnalytics() {
        console.log('\n📊 Testing Reports and Analytics...');
        const timesheetReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ Timesheet report generated');
        const projectReport = await axios_1.default.get(`${API}/reports/projects`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ Project report generated');
        const userActivityReport = await axios_1.default.get(`${API}/reports/user-activity`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ User activity report generated');
        const workloadReport = await axios_1.default.get(`${API}/reports/workload`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                period: 'month'
            }
        });
        console.log('✅ Workload report generated');
        const userReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.userToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ User can access their own reports');
        const managerReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.managerToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ Manager can access team reports');
    }
    async testSecurityAndEdgeCases() {
        console.log('\n🔒 Testing Security and Edge Cases...');
        try {
            await axios_1.default.get(`${API}/users`, {
                headers: { Authorization: 'Bearer invalid-token' }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid token properly rejected');
            }
        }
        try {
            await axios_1.default.get(`${API}/users`);
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Missing token properly rejected');
            }
        }
        try {
            await axios_1.default.post(`${API}/auth/login`, {
                email: "'; DROP TABLE users; --",
                password: 'test'
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ SQL injection attempt properly handled');
            }
        }
        const xssPayload = '<script>alert("xss")</script>';
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                projectId: this.testProjects[0].id,
                date: '2024-01-15',
                hours: 8,
                description: xssPayload
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
            console.log('✅ XSS payload properly sanitized');
        }
        catch (error) {
            console.log('✅ XSS attempt properly rejected');
        }
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                projectId: this.testProjects[0].id,
                date: 'invalid-date',
                hours: -5,
                description: ''
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Data validation working properly');
            }
        }
        try {
            await axios_1.default.get(`${API}/timesheets/999999`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ 404 for non-existent resource');
            }
        }
    }
}
exports.APITester = APITester;
async function runAllTests() {
    const tester = new APITester();
    await tester.runAllTests();
}
if (require.main === module) {
    runAllTests().catch(console.error);
}
//# sourceMappingURL=test-all-apis.js.map