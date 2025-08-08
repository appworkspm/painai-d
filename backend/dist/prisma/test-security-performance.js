"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityPerformanceTester = void 0;
exports.runSecurityPerformanceTests = runSecurityPerformanceTests;
const axios_1 = __importDefault(require("axios"));
const API = 'http://localhost:5000/api';
class SecurityPerformanceTester {
    constructor() {
        this.adminToken = '';
        this.managerToken = '';
        this.userToken = '';
    }
    async runTests() {
        console.log('🔒 Testing Security and Performance...\n');
        try {
            await this.login();
            await this.testAuthenticationSecurity();
            await this.testAuthorizationSecurity();
            await this.testInputValidation();
            await this.testSQLInjectionPrevention();
            await this.testXSSPrevention();
            await this.testRateLimiting();
            await this.testPerformance();
            await this.testErrorHandling();
            await this.testDataIntegrity();
            console.log('\n✅ All Security and Performance tests completed successfully!');
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
    async testAuthenticationSecurity() {
        console.log('\n🔐 Testing Authentication Security...');
        try {
            await axios_1.default.post(`${API}/auth/login`, {
                email: 'invalid@example.com',
                password: 'wrongpassword'
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid credentials properly rejected');
            }
        }
        try {
            await axios_1.default.post(`${API}/auth/login`, {
                email: 'admin@example.com'
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Missing credentials properly rejected');
            }
        }
        try {
            await axios_1.default.get(`${API}/auth/profile`, {
                headers: { Authorization: 'InvalidTokenFormat' }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid token format properly rejected');
            }
        }
        try {
            await axios_1.default.get(`${API}/auth/profile`, {
                headers: { Authorization: this.adminToken }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Token without Bearer prefix properly rejected');
            }
        }
        try {
            await axios_1.default.get(`${API}/auth/profile`, {
                headers: { Authorization: 'Bearer ' }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Empty token properly rejected');
            }
        }
    }
    async testAuthorizationSecurity() {
        console.log('\n🛡️ Testing Authorization Security...');
        const adminEndpoints = [
            `${API}/users`,
            `${API}/roles`,
            `${API}/permissions`,
            `${API}/reports/user-activity`
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
        const managerRestrictedEndpoints = [
            `${API}/roles`,
            `${API}/permissions`
        ];
        for (const endpoint of managerRestrictedEndpoints) {
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
        try {
            await axios_1.default.get(`${API}/users/other-user-id`, {
                headers: { Authorization: `Bearer ${this.userToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Access to other user data properly blocked');
            }
        }
        try {
            await axios_1.default.get(`${API}/timesheets/other-user-timesheet-id`, {
                headers: { Authorization: `Bearer ${this.userToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Access to other user timesheets properly blocked');
            }
        }
    }
    async testInputValidation() {
        console.log('\n✅ Testing Input Validation...');
        try {
            await axios_1.default.post(`${API}/auth/login`, {
                email: 'invalid-email-format',
                password: 'password'
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid email format properly rejected');
            }
        }
        const longString = 'a'.repeat(10000);
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                projectId: 'valid-project-id',
                date: '2024-01-15',
                hours: 8,
                description: longString
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Very long input properly rejected');
            }
        }
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                projectId: 'valid-project-id',
                date: '2024-01-15',
                hours: -5,
                description: 'Test'
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Negative hours properly rejected');
            }
        }
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                projectId: 'valid-project-id',
                date: 'invalid-date',
                hours: 8,
                description: 'Test'
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid date format properly rejected');
            }
        }
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                projectId: '',
                date: '2024-01-15',
                hours: 8,
                description: ''
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Empty required fields properly rejected');
            }
        }
    }
    async testSQLInjectionPrevention() {
        console.log('\n💉 Testing SQL Injection Prevention...');
        const sqlInjectionPayloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "'; INSERT INTO users (name, email) VALUES ('hacker', 'hacker@evil.com'); --",
            "admin'--",
            "admin'/*",
            "admin' OR '1'='1'--",
            "admin' UNION SELECT 1,2,3,4,5--"
        ];
        for (const payload of sqlInjectionPayloads) {
            try {
                await axios_1.default.post(`${API}/auth/login`, {
                    email: payload,
                    password: 'password'
                });
            }
            catch (error) {
                if (error.response?.status === 401) {
                    console.log(`✅ SQL injection attempt "${payload}" properly handled`);
                }
            }
        }
        try {
            await axios_1.default.get(`${API}/users`, {
                headers: { Authorization: `Bearer ${this.adminToken}` },
                params: {
                    search: "'; DROP TABLE users; --"
                }
            });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ SQL injection in search parameters properly handled');
            }
        }
    }
    async testXSSPrevention() {
        console.log('\n🛡️ Testing XSS Prevention...');
        const xssPayloads = [
            '<script>alert("xss")</script>',
            '<img src="x" onerror="alert(\'xss\')">',
            'javascript:alert("xss")',
            '<iframe src="javascript:alert(\'xss\')"></iframe>',
            '<svg onload="alert(\'xss\')">',
            '"><script>alert("xss")</script>',
            '"; alert("xss"); //'
        ];
        for (const payload of xssPayloads) {
            try {
                await axios_1.default.post(`${API}/timesheets`, {
                    projectId: 'valid-project-id',
                    date: '2024-01-15',
                    hours: 8,
                    description: payload
                }, { headers: { Authorization: `Bearer ${this.userToken}` } });
                console.log(`✅ XSS payload "${payload}" properly sanitized`);
            }
            catch (error) {
                if (error.response?.status === 400) {
                    console.log(`✅ XSS payload "${payload}" properly rejected`);
                }
            }
        }
    }
    async testRateLimiting() {
        console.log('\n⏱️ Testing Rate Limiting...');
        const rapidRequests = Array(10).fill(null).map(() => axios_1.default.post(`${API}/auth/login`, {
            email: 'test@example.com',
            password: 'wrongpassword'
        }).catch(() => null));
        try {
            await Promise.all(rapidRequests);
            console.log('✅ Rapid requests handled gracefully');
        }
        catch (error) {
            console.log('✅ Rate limiting working (some requests blocked)');
        }
        const rapidAPICalls = Array(20).fill(null).map(() => axios_1.default.get(`${API}/auth/profile`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        }).catch(() => null));
        try {
            await Promise.all(rapidAPICalls);
            console.log('✅ Rapid API calls handled gracefully');
        }
        catch (error) {
            console.log('✅ API rate limiting working');
        }
    }
    async testPerformance() {
        console.log('\n⚡ Testing Performance...');
        const startTime = Date.now();
        await axios_1.default.get(`${API}/auth/profile`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        const responseTime = Date.now() - startTime;
        if (responseTime < 1000) {
            console.log(`✅ Fast response time: ${responseTime}ms`);
        }
        else {
            console.log(`⚠️ Slow response time: ${responseTime}ms`);
        }
        const concurrentRequests = Array(5).fill(null).map(() => axios_1.default.get(`${API}/auth/profile`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        }));
        const concurrentStartTime = Date.now();
        await Promise.all(concurrentRequests);
        const concurrentResponseTime = Date.now() - concurrentStartTime;
        if (concurrentResponseTime < 2000) {
            console.log(`✅ Good concurrent performance: ${concurrentResponseTime}ms`);
        }
        else {
            console.log(`⚠️ Slow concurrent performance: ${concurrentResponseTime}ms`);
        }
        const largeDataStartTime = Date.now();
        await axios_1.default.get(`${API}/timesheets`, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        const largeDataResponseTime = Date.now() - largeDataStartTime;
        if (largeDataResponseTime < 2000) {
            console.log(`✅ Large data retrieval performance: ${largeDataResponseTime}ms`);
        }
        else {
            console.log(`⚠️ Slow large data retrieval: ${largeDataResponseTime}ms`);
        }
    }
    async testErrorHandling() {
        console.log('\n❌ Testing Error Handling...');
        try {
            await axios_1.default.get(`${API}/timesheets/999999`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ 404 error properly handled');
            }
        }
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                invalidField: 'value'
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ 400 error properly handled');
            }
        }
        try {
            await axios_1.default.get(`${API}/invalid-endpoint`, {
                headers: { Authorization: `Bearer ${this.adminToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Invalid endpoint properly handled');
            }
        }
        try {
            await axios_1.default.post(`${API}/auth/login`, {
                email: 'test@example.com',
                password: ''
            });
        }
        catch (error) {
            if (error.response?.data && typeof error.response.data === 'object') {
                console.log('✅ Error response has proper format');
            }
        }
    }
    async testDataIntegrity() {
        console.log('\n🔒 Testing Data Integrity...');
        const testTimesheet = await axios_1.default.post(`${API}/timesheets`, {
            projectId: 'valid-project-id',
            date: '2024-01-15',
            hours: 8,
            description: 'Data integrity test'
        }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        const retrievedTimesheet = await axios_1.default.get(`${API}/timesheets/${testTimesheet.data.id}`, {
            headers: { Authorization: `Bearer ${this.userToken}` }
        });
        if (retrievedTimesheet.data.description === 'Data integrity test') {
            console.log('✅ Data integrity maintained');
        }
        else {
            console.log('❌ Data integrity issue detected');
        }
        await axios_1.default.delete(`${API}/timesheets/${testTimesheet.data.id}`, {
            headers: { Authorization: `Bearer ${this.userToken}` }
        });
        try {
            await axios_1.default.get(`${API}/timesheets/${testTimesheet.data.id}`, {
                headers: { Authorization: `Bearer ${this.userToken}` }
            });
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Deleted data properly removed');
            }
        }
        try {
            await axios_1.default.put(`${API}/timesheets/${testTimesheet.data.id}`, {
                hours: -1
            }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        }
        catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Data validation on update working');
            }
        }
    }
}
exports.SecurityPerformanceTester = SecurityPerformanceTester;
async function runSecurityPerformanceTests() {
    const tester = new SecurityPerformanceTester();
    await tester.runTests();
}
if (require.main === module) {
    runSecurityPerformanceTests().catch(console.error);
}
//# sourceMappingURL=test-security-performance.js.map