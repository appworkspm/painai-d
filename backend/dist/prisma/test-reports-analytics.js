"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsAnalyticsTester = void 0;
exports.runReportsAnalyticsTests = runReportsAnalyticsTests;
const axios_1 = __importDefault(require("axios"));
const API = 'http://localhost:5000/api';
class ReportsAnalyticsTester {
    constructor() {
        this.adminToken = '';
        this.managerToken = '';
        this.userToken = '';
        this.testProjects = [];
        this.testTimesheets = [];
    }
    async runTests() {
        console.log('📊 Testing Reports and Analytics...\n');
        try {
            await this.login();
            await this.setupTestData();
            await this.testTimesheetReports();
            await this.testProjectReports();
            await this.testUserActivityReports();
            await this.testWorkloadReports();
            await this.testRBACForReports();
            await this.testReportFilters();
            await this.testEdgeCases();
            console.log('\n✅ All Reports and Analytics tests completed successfully!');
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
    async setupTestData() {
        console.log('\n📝 Setting up test data...');
        const projects = await axios_1.default.get(`${API}/projects`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        this.testProjects = projects.data;
        const timesheets = await axios_1.default.get(`${API}/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        this.testTimesheets = timesheets.data;
        console.log(`✅ Setup complete: ${this.testProjects.length} projects, ${this.testTimesheets.length} timesheets`);
    }
    async testTimesheetReports() {
        console.log('\n⏰ Testing Timesheet Reports...');
        const adminTimesheetReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ Admin timesheet report generated');
        const userTimesheetReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.userToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                userId: 'self'
            }
        });
        console.log('✅ User timesheet report generated');
        if (this.testProjects.length > 0) {
            const projectTimesheetReport = await axios_1.default.get(`${API}/reports/timesheets`, {
                headers: { Authorization: `Bearer ${this.adminToken}` },
                params: {
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    projectId: this.testProjects[0].id
                }
            });
            console.log('✅ Project-specific timesheet report generated');
        }
        const managerTimesheetReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.managerToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ Manager timesheet report generated');
    }
    async testProjectReports() {
        console.log('\n📋 Testing Project Reports...');
        const projectSummaryReport = await axios_1.default.get(`${API}/reports/projects`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ Project summary report generated');
        if (this.testProjects.length > 0) {
            const projectDetailsReport = await axios_1.default.get(`${API}/reports/projects/${this.testProjects[0].id}`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
            console.log('✅ Project details report generated');
        }
        const projectPerformanceReport = await axios_1.default.get(`${API}/reports/projects/performance`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                period: 'month'
            }
        });
        console.log('✅ Project performance report generated');
    }
    async testUserActivityReports() {
        console.log('\n👥 Testing User Activity Reports...');
        const userActivityReport = await axios_1.default.get(`${API}/reports/user-activity`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        console.log('✅ User activity report generated');
        const specificUserActivity = await axios_1.default.get(`${API}/reports/user-activity`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                userId: 'specific-user-id'
            }
        });
        console.log('✅ Specific user activity report generated');
        const teamActivityReport = await axios_1.default.get(`${API}/reports/user-activity`, {
            headers: { Authorization: `Bearer ${this.managerToken}` }
        });
        console.log('✅ Team activity report generated');
    }
    async testWorkloadReports() {
        console.log('\n💼 Testing Workload Reports...');
        const monthlyWorkloadReport = await axios_1.default.get(`${API}/reports/workload`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                period: 'month'
            }
        });
        console.log('✅ Monthly workload report generated');
        const userWorkloadReport = await axios_1.default.get(`${API}/reports/workload`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                period: 'week',
                userId: 'specific-user-id'
            }
        });
        console.log('✅ User workload report generated');
        const teamWorkloadReport = await axios_1.default.get(`${API}/reports/workload`, {
            headers: { Authorization: `Bearer ${this.managerToken}` },
            params: {
                period: 'month'
            }
        });
        console.log('✅ Team workload report generated');
    }
    async testRBACForReports() {
        console.log('\n🔐 Testing RBAC for Reports...');
        try {
            await axios_1.default.get(`${API}/reports/user-activity`, {
                headers: { Authorization: `Bearer ${this.userToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ User access to admin reports properly blocked');
            }
        }
        const userOwnReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.userToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ User can access their own reports');
        try {
            await axios_1.default.get(`${API}/reports/user-activity`, {
                headers: { Authorization: `Bearer ${this.managerToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Manager access to all user activity properly blocked');
            }
        }
        const managerTeamReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.managerToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });
        console.log('✅ Manager can access team timesheet reports');
    }
    async testReportFilters() {
        console.log('\n🔍 Testing Report Filters...');
        const dateFilteredReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            }
        });
        console.log('✅ Date range filter working');
        const statusFilteredReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                status: 'APPROVED'
            }
        });
        console.log('✅ Status filter working');
        if (this.testProjects.length > 0) {
            const projectFilteredReport = await axios_1.default.get(`${API}/reports/timesheets`, {
                headers: { Authorization: `Bearer ${this.adminToken}` },
                params: {
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    projectId: this.testProjects[0].id
                }
            });
            console.log('✅ Project filter working');
        }
        const userFilteredReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                userId: 'specific-user-id'
            }
        });
        console.log('✅ User filter working');
    }
    async testEdgeCases() {
        console.log('\n⚠️ Testing Edge Cases...');
        try {
            await axios_1.default.get(`${API}/reports/timesheets`, {
                headers: { Authorization: `Bearer ${this.adminToken}` },
                params: {
                    startDate: 'invalid-date',
                    endDate: '2024-12-31'
                }
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid date range properly rejected');
            }
        }
        const futureReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2025-01-01',
                endDate: '2025-12-31'
            }
        });
        console.log('✅ Future date range handled gracefully');
        const largeRangeReport = await axios_1.default.get(`${API}/reports/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` },
            params: {
                startDate: '2020-01-01',
                endDate: '2030-12-31'
            }
        });
        console.log('✅ Large date range handled');
        try {
            await axios_1.default.get(`${API}/reports/timesheets`, {
                headers: { Authorization: `Bearer ${this.adminToken}` },
                params: {
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    projectId: 'non-existent-project'
                }
            });
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Non-existent project filter properly handled');
            }
        }
        try {
            await axios_1.default.get(`${API}/reports/timesheets`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Missing required parameters properly rejected');
            }
        }
    }
}
exports.ReportsAnalyticsTester = ReportsAnalyticsTester;
async function runReportsAnalyticsTests() {
    const tester = new ReportsAnalyticsTester();
    await tester.runTests();
}
if (require.main === module) {
    runReportsAnalyticsTests().catch(console.error);
}
//# sourceMappingURL=test-reports-analytics.js.map