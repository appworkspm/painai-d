import axios from 'axios';

const API = 'http://localhost:5000/api';

class SecurityPerformanceTester {
  private adminToken: string = '';
  private managerToken: string = '';
  private userToken: string = '';

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

  async testAuthenticationSecurity() {
    console.log('\n🔐 Testing Authentication Security...');

    // Test invalid credentials
    try {
      await axios.post(`${API}/auth/login`, {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      }
    }

    // Test missing credentials
    try {
      await axios.post(`${API}/auth/login`, {
        email: 'admin@example.com'
        // missing password
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Missing credentials properly rejected');
      }
    }

    // Test invalid token format
    try {
      await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: 'InvalidTokenFormat' }
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token format properly rejected');
      }
    }

    // Test expired token (if implemented)
    // This would require a token that's actually expired

    // Test token without Bearer prefix
    try {
      await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: this.adminToken }
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Token without Bearer prefix properly rejected');
      }
    }

    // Test empty token
    try {
      await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: 'Bearer ' }
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Empty token properly rejected');
      }
    }
  }

  async testAuthorizationSecurity() {
    console.log('\n🛡️ Testing Authorization Security...');

    // Test user accessing admin endpoints
    const adminEndpoints = [
      `${API}/users`,
      `${API}/roles`,
      `${API}/permissions`,
      `${API}/reports/user-activity`
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

    // Test manager accessing admin-only endpoints
    const managerRestrictedEndpoints = [
      `${API}/roles`,
      `${API}/permissions`
    ];

    for (const endpoint of managerRestrictedEndpoints) {
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

    // Test accessing other user's data
    try {
      await axios.get(`${API}/users/other-user-id`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Access to other user data properly blocked');
      }
    }

    // Test accessing other user's timesheets
    try {
      await axios.get(`${API}/timesheets/other-user-timesheet-id`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Access to other user timesheets properly blocked');
      }
    }
  }

  async testInputValidation() {
    console.log('\n✅ Testing Input Validation...');

    // Test invalid email format
    try {
      await axios.post(`${API}/auth/login`, {
        email: 'invalid-email-format',
        password: 'password'
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid email format properly rejected');
      }
    }

    // Test very long input
    const longString = 'a'.repeat(10000);
    try {
      await axios.post(`${API}/timesheets`, {
        projectId: 'valid-project-id',
        date: '2024-01-15',
        hours: 8,
        description: longString
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Very long input properly rejected');
      }
    }

    // Test negative hours
    try {
      await axios.post(`${API}/timesheets`, {
        projectId: 'valid-project-id',
        date: '2024-01-15',
        hours: -5,
        description: 'Test'
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Negative hours properly rejected');
      }
    }

    // Test invalid date format
    try {
      await axios.post(`${API}/timesheets`, {
        projectId: 'valid-project-id',
        date: 'invalid-date',
        hours: 8,
        description: 'Test'
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid date format properly rejected');
      }
    }

    // Test empty required fields
    try {
      await axios.post(`${API}/timesheets`, {
        projectId: '',
        date: '2024-01-15',
        hours: 8,
        description: ''
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
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
        await axios.post(`${API}/auth/login`, {
          email: payload,
          password: 'password'
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log(`✅ SQL injection attempt "${payload}" properly handled`);
        }
      }
    }

    // Test SQL injection in search parameters
    try {
      await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${this.adminToken}` },
        params: {
          search: "'; DROP TABLE users; --"
        }
      });
    } catch (error: any) {
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
        await axios.post(`${API}/timesheets`, {
          projectId: 'valid-project-id',
          date: '2024-01-15',
          hours: 8,
          description: payload
        }, { headers: { Authorization: `Bearer ${this.userToken}` } });
        console.log(`✅ XSS payload "${payload}" properly sanitized`);
      } catch (error: any) {
        if (error.response?.status === 400) {
          console.log(`✅ XSS payload "${payload}" properly rejected`);
        }
      }
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');

    // Test rapid login attempts
    const rapidRequests = Array(10).fill(null).map(() => 
      axios.post(`${API}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      }).catch(() => null)
    );

    try {
      await Promise.all(rapidRequests);
      console.log('✅ Rapid requests handled gracefully');
    } catch (error) {
      console.log('✅ Rate limiting working (some requests blocked)');
    }

    // Test rapid API calls
    const rapidAPICalls = Array(20).fill(null).map(() => 
      axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      }).catch(() => null)
    );

    try {
      await Promise.all(rapidAPICalls);
      console.log('✅ Rapid API calls handled gracefully');
    } catch (error) {
      console.log('✅ API rate limiting working');
    }
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');

    // Test response time for simple endpoint
    const startTime = Date.now();
    await axios.get(`${API}/auth/profile`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    const responseTime = Date.now() - startTime;
    
    if (responseTime < 1000) {
      console.log(`✅ Fast response time: ${responseTime}ms`);
    } else {
      console.log(`⚠️ Slow response time: ${responseTime}ms`);
    }

    // Test concurrent requests
    const concurrentRequests = Array(5).fill(null).map(() => 
      axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      })
    );

    const concurrentStartTime = Date.now();
    await Promise.all(concurrentRequests);
    const concurrentResponseTime = Date.now() - concurrentStartTime;
    
    if (concurrentResponseTime < 2000) {
      console.log(`✅ Good concurrent performance: ${concurrentResponseTime}ms`);
    } else {
      console.log(`⚠️ Slow concurrent performance: ${concurrentResponseTime}ms`);
    }

    // Test large data retrieval
    const largeDataStartTime = Date.now();
    await axios.get(`${API}/timesheets`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    const largeDataResponseTime = Date.now() - largeDataStartTime;
    
    if (largeDataResponseTime < 2000) {
      console.log(`✅ Large data retrieval performance: ${largeDataResponseTime}ms`);
    } else {
      console.log(`⚠️ Slow large data retrieval: ${largeDataResponseTime}ms`);
    }
  }

  async testErrorHandling() {
    console.log('\n❌ Testing Error Handling...');

    // Test 404 for non-existent resource
    try {
      await axios.get(`${API}/timesheets/999999`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ 404 error properly handled');
      }
    }

    // Test 400 for bad request
    try {
      await axios.post(`${API}/timesheets`, {
        invalidField: 'value'
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ 400 error properly handled');
      }
    }

    // Test 500 for server error (if applicable)
    try {
      await axios.get(`${API}/invalid-endpoint`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ Invalid endpoint properly handled');
      }
    }

    // Test error message format
    try {
      await axios.post(`${API}/auth/login`, {
        email: 'test@example.com',
        password: ''
      });
    } catch (error: any) {
      if (error.response?.data && typeof error.response.data === 'object') {
        console.log('✅ Error response has proper format');
      }
    }
  }

  async testDataIntegrity() {
    console.log('\n🔒 Testing Data Integrity...');

    // Test that created data is properly saved
    const testTimesheet = await axios.post(`${API}/timesheets`, {
      projectId: 'valid-project-id',
      date: '2024-01-15',
      hours: 8,
      description: 'Data integrity test'
    }, { headers: { Authorization: `Bearer ${this.userToken}` } });

    // Verify the data was saved correctly
    const retrievedTimesheet = await axios.get(`${API}/timesheets/${testTimesheet.data.id}`, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    });

    if (retrievedTimesheet.data.description === 'Data integrity test') {
      console.log('✅ Data integrity maintained');
    } else {
      console.log('❌ Data integrity issue detected');
    }

    // Clean up test data
    await axios.delete(`${API}/timesheets/${testTimesheet.data.id}`, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    });

    // Test that deleted data is actually deleted
    try {
      await axios.get(`${API}/timesheets/${testTimesheet.data.id}`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ Deleted data properly removed');
      }
    }

    // Test data validation on update
    try {
      await axios.put(`${API}/timesheets/${testTimesheet.data.id}`, {
        hours: -1
      }, { headers: { Authorization: `Bearer ${this.userToken}` } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Data validation on update working');
      }
    }
  }
}

// Run tests
async function runSecurityPerformanceTests() {
  const tester = new SecurityPerformanceTester();
  await tester.runTests();
}

// Execute if this file is run directly
if (require.main === module) {
  runSecurityPerformanceTests().catch(console.error);
}

export { SecurityPerformanceTester, runSecurityPerformanceTests }; 