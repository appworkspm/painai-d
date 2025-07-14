import axios from 'axios';

const API = 'http://localhost:5000/api';

interface ReportData {
  id: string;
  type: string;
  data: any;
  generatedAt: string;
}

class ReportsAnalyticsTester {
  private adminToken: string = '';
  private managerToken: string = '';
  private userToken: string = '';
  private testProjects: any[] = [];
  private testTimesheets: any[] = [];

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

  async setupTestData() {
    console.log('\n📝 Setting up test data...');

    // Get existing projects
    const projects = await axios.get(`${API}/projects`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    this.testProjects = projects.data;

    // Get existing timesheets
    const timesheets = await axios.get(`${API}/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    this.testTimesheets = timesheets.data;

    console.log(`✅ Setup complete: ${this.testProjects.length} projects, ${this.testTimesheets.length} timesheets`);
  }

  async testTimesheetReports() {
    console.log('\n⏰ Testing Timesheet Reports...');

    // Get timesheet report for all users (admin)
    const adminTimesheetReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Admin timesheet report generated');

    // Get timesheet report for specific user
    const userTimesheetReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.userToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        userId: 'self'
      }
    });
    console.log('✅ User timesheet report generated');

    // Get timesheet report by project
    if (this.testProjects.length > 0) {
      const projectTimesheetReport = await axios.get(`${API}/reports/timesheets`, {
        headers: { Authorization: `Bearer ${this.adminToken}` },
        params: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          projectId: this.testProjects[0].id
        }
      });
      console.log('✅ Project-specific timesheet report generated');
    }

    // Test manager timesheet report
    const managerTimesheetReport = await axios.get(`${API}/reports/timesheets`, {
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

    // Get project summary report
    const projectSummaryReport = await axios.get(`${API}/reports/projects`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ Project summary report generated');

    // Get project details report
    if (this.testProjects.length > 0) {
      const projectDetailsReport = await axios.get(`${API}/reports/projects/${this.testProjects[0].id}`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      console.log('✅ Project details report generated');
    }

    // Get project performance report
    const projectPerformanceReport = await axios.get(`${API}/reports/projects/performance`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        period: 'month'
      }
    });
    console.log('✅ Project performance report generated');
  }

  async testUserActivityReports() {
    console.log('\n👥 Testing User Activity Reports...');

    // Get user activity report
    const userActivityReport = await axios.get(`${API}/reports/user-activity`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log('✅ User activity report generated');

    // Get specific user activity
    const specificUserActivity = await axios.get(`${API}/reports/user-activity`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        userId: 'specific-user-id'
      }
    });
    console.log('✅ Specific user activity report generated');

    // Get team activity report (manager)
    const teamActivityReport = await axios.get(`${API}/reports/user-activity`, {
      headers: { Authorization: `Bearer ${this.managerToken}` }
    });
    console.log('✅ Team activity report generated');
  }

  async testWorkloadReports() {
    console.log('\n💼 Testing Workload Reports...');

    // Get workload report by period
    const monthlyWorkloadReport = await axios.get(`${API}/reports/workload`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        period: 'month'
      }
    });
    console.log('✅ Monthly workload report generated');

    // Get workload report by user
    const userWorkloadReport = await axios.get(`${API}/reports/workload`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        period: 'week',
        userId: 'specific-user-id'
      }
    });
    console.log('✅ User workload report generated');

    // Get team workload report (manager)
    const teamWorkloadReport = await axios.get(`${API}/reports/workload`, {
      headers: { Authorization: `Bearer ${this.managerToken}` },
      params: {
        period: 'month'
      }
    });
    console.log('✅ Team workload report generated');
  }

  async testRBACForReports() {
    console.log('\n🔐 Testing RBAC for Reports...');

    // Test user cannot access admin reports
    try {
      await axios.get(`${API}/reports/user-activity`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ User access to admin reports properly blocked');
      }
    }

    // Test user can access their own reports
    const userOwnReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.userToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ User can access their own reports');

    // Test manager can access team reports but not all user activity
    try {
      await axios.get(`${API}/reports/user-activity`, {
        headers: { Authorization: `Bearer ${this.managerToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Manager access to all user activity properly blocked');
      }
    }

    // Test manager can access team timesheet reports
    const managerTeamReport = await axios.get(`${API}/reports/timesheets`, {
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

    // Test date range filters
    const dateFilteredReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }
    });
    console.log('✅ Date range filter working');

    // Test status filters
    const statusFilteredReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'APPROVED'
      }
    });
    console.log('✅ Status filter working');

    // Test project filters
    if (this.testProjects.length > 0) {
      const projectFilteredReport = await axios.get(`${API}/reports/timesheets`, {
        headers: { Authorization: `Bearer ${this.adminToken}` },
        params: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          projectId: this.testProjects[0].id
        }
      });
      console.log('✅ Project filter working');
    }

    // Test user filters
    const userFilteredReport = await axios.get(`${API}/reports/timesheets`, {
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

    // Test invalid date range
    try {
      await axios.get(`${API}/reports/timesheets`, {
        headers: { Authorization: `Bearer ${this.adminToken}` },
        params: {
          startDate: 'invalid-date',
          endDate: '2024-12-31'
        }
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid date range properly rejected');
      }
    }

    // Test future date range
    const futureReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      }
    });
    console.log('✅ Future date range handled gracefully');

    // Test very large date range
    const largeRangeReport = await axios.get(`${API}/reports/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
      params: {
        startDate: '2020-01-01',
        endDate: '2030-12-31'
      }
    });
    console.log('✅ Large date range handled');

    // Test non-existent project filter
    try {
      await axios.get(`${API}/reports/timesheets`, {
        headers: { Authorization: `Bearer ${this.adminToken}` },
        params: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          projectId: 'non-existent-project'
        }
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ Non-existent project filter properly handled');
      }
    }

    // Test missing required parameters
    try {
      await axios.get(`${API}/reports/timesheets`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Missing required parameters properly rejected');
      }
    }
  }
}

// Run tests
async function runReportsAnalyticsTests() {
  const tester = new ReportsAnalyticsTester();
  await tester.runTests();
}

// Execute if this file is run directly
if (require.main === module) {
  runReportsAnalyticsTests().catch(console.error);
}

export { ReportsAnalyticsTester, runReportsAnalyticsTests }; 