import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

const cred = {
  admin: { email: 'admin@painai.com', password: 'admin123' },
  manager: { email: 'manager@painai.com', password: 'manager123' },
  user: { email: 'user@painai.com', password: 'user123' },
};

async function login(role: keyof typeof cred) {
  const { email, password } = cred[role];
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  if (!res.data.success) throw new Error(`${role} login failed`);
  console.log(`✅ ${role} login OK`);
  return res.data.data.token as string;
}

async function main() {
  console.log('🔍 Painai System Check');
  try {
    // health check
    const health = await axios.get(BASE_URL.replace('/api', '/health'));
    console.log('✅ API health:', health.data.status);

    const tokens = {
      admin: await login('admin'),
      manager: await login('manager'),
      user: await login('user'),
    };

    // simple profile fetch
    await axios.get(`${BASE_URL}/auth/profile`, { headers: { Authorization: `Bearer ${tokens.user}` } });
    console.log('✅ Profile endpoint');

    // fetch dashboard essentials
    await axios.get(`${BASE_URL}/projects`, { headers: { Authorization: `Bearer ${tokens.admin}` } });
    console.log('✅ Projects list');

    await axios.get(`${BASE_URL}/timesheets/my`, { headers: { Authorization: `Bearer ${tokens.user}` } });
    console.log('✅ User timesheets');

    await axios.get(`${BASE_URL}/reports/workload`, { headers: { Authorization: `Bearer ${tokens.admin}` } });
    console.log('✅ Workload report');

    await axios.get(`${BASE_URL}/activities`, { headers: { Authorization: `Bearer ${tokens.admin}` } });
    console.log('✅ Activities log');

    await axios.get(`${BASE_URL}/holidays`, { headers: { Authorization: `Bearer ${tokens.admin}` } });
    console.log('✅ Holidays list');

    console.log('\n🎉 System check completed – everything looks good');
  } catch (err: any) {
    console.error('❌ System check failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

main();