import axios from 'axios';

const API = 'https://painai.onrender.com/api';
const users = {
  admin: {
    email: 'jakgrits.ph@appworks.co.th',
    password: 'password123',
    token: '',
  },
  manager: {
    email: 'pratya.fu@appworks.co.th',
    password: 'password123',
    token: '',
  },
  user: {
    email: 'nawin.bu@appworks.co.th',
    password: 'password123',
    token: '',
  },
};

type Role = 'admin' | 'manager' | 'user';
const roles: Role[] = ['admin', 'manager', 'user'];

function getRandomActivity() {
  return 'E2E_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
function getRandomDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 10));
  return d.toISOString().split('T')[0];
}

async function loginAndGetToken(email: string, password: string) {
  try {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    return res.data.token;
  } catch (err: any) {
    console.error(`❌ Login failed for ${email}:`, err.response?.data || err.message);
    return '';
  }
}

async function run() {
  // 1. Login ทุก role
  for (const role of roles) {
    users[role].token = await loginAndGetToken(users[role].email, users[role].password);
  }
  if (!users.user.token || !users.manager.token || !users.admin.token) {
    console.error('❌ Login failed for one or more roles.');
    return;
  }

  // 2. User: Create, Edit, Delete, Submit, Validation
  const activity = getRandomActivity();
  const date = getRandomDate();
  let timesheetId = '';
  try {
    // Create timesheet
    const createRes = await axios.post(
      `${API}/timesheets`,
      {
        activity,
        date,
        hours_worked: 2,
        description: 'E2E API test',
        work_type: 'PROJECT',
        status: 'draft',
      },
      { headers: { Authorization: `Bearer ${users.user.token}` } }
    );
    timesheetId = createRes.data.timesheet.id;
    console.log('✅ User created timesheet:', timesheetId);

    // Validation: duplicate date
    try {
      await axios.post(
        `${API}/timesheets`,
        {
          activity: getRandomActivity(),
          date,
          hours_worked: 1,
          description: 'Duplicate date',
          work_type: 'PROJECT',
          status: 'draft',
        },
        { headers: { Authorization: `Bearer ${users.user.token}` } }
      );
      console.error('❌ Duplicate timesheet allowed!');
    } catch (err: any) {
      console.log('✅ Duplicate timesheet blocked:', err.response?.data?.message);
    }

    // Edit timesheet
    await axios.put(
      `${API}/timesheets/${timesheetId}`,
      { description: 'E2E API test (edited)' },
      { headers: { Authorization: `Bearer ${users.user.token}` } }
    );
    console.log('✅ User edited timesheet');

    // Submit timesheet
    await axios.patch(
      `${API}/timesheets/${timesheetId}/submit`,
      {},
      { headers: { Authorization: `Bearer ${users.user.token}` } }
    );
    console.log('✅ User submitted timesheet');

    // Validation: submit again
    try {
      await axios.patch(
        `${API}/timesheets/${timesheetId}/submit`,
        {},
        { headers: { Authorization: `Bearer ${users.user.token}` } }
      );
      console.error('❌ Submit already submitted timesheet allowed!');
    } catch (err: any) {
      console.log('✅ Submit already submitted timesheet blocked:', err.response?.data?.message);
    }

    // Delete timesheet (should fail after submit)
    try {
      await axios.delete(
        `${API}/timesheets/${timesheetId}`,
        { headers: { Authorization: `Bearer ${users.user.token}` } }
      );
      console.error('❌ Delete submitted timesheet allowed!');
    } catch (err: any) {
      console.log('✅ Delete submitted timesheet blocked:', err.response?.data?.message);
    }
  } catch (err: any) {
    console.error('❌ User workflow error:', err.response?.data || err.message);
  }

  // 3. Manager: Approve, Reject, Permission
  try {
    // Approve timesheet
    await axios.patch(
      `${API}/timesheets/${timesheetId}/approve`,
      { status: 'approved' },
      { headers: { Authorization: `Bearer ${users.manager.token}` } }
    );
    console.log('✅ Manager approved timesheet');

    // Reject (สร้างใหม่แล้ว reject)
    const activity2 = getRandomActivity();
    const date2 = getRandomDate();
    const createRes2 = await axios.post(
      `${API}/timesheets`,
      {
        activity: activity2,
        date: date2,
        hours_worked: 1,
        description: 'E2E API test reject',
        work_type: 'PROJECT',
        status: 'draft',
      },
      { headers: { Authorization: `Bearer ${users.user.token}` } }
    );
    const timesheetId2 = createRes2.data.timesheet.id;
    await axios.patch(
      `${API}/timesheets/${timesheetId2}/submit`,
      {},
      { headers: { Authorization: `Bearer ${users.user.token}` } }
    );
    await axios.patch(
      `${API}/timesheets/${timesheetId2}/reject`,
      { rejection_reason: 'E2E reject' },
      { headers: { Authorization: `Bearer ${users.manager.token}` } }
    );
    console.log('✅ Manager rejected timesheet');

    // Permission: user cannot approve
    try {
      await axios.patch(
        `${API}/timesheets/${timesheetId2}/approve`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${users.user.token}` } }
      );
      console.error('❌ User can approve timesheet!');
    } catch (err: any) {
      console.log('✅ User cannot approve timesheet:', err.response?.data?.message);
    }
  } catch (err: any) {
    console.error('❌ Manager workflow error:', err.response?.data || err.message);
  }

  // 4. Admin: Access, CRUD user/role, permission
  try {
    // Access users
    const usersRes = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${users.admin.token}` } });
    console.log('✅ Admin accessed users:', usersRes.data.data.length, 'users');
    // Access roles
    const rolesRes = await axios.get(`${API}/users/roles`, { headers: { Authorization: `Bearer ${users.admin.token}` } });
    console.log('✅ Admin accessed roles:', rolesRes.data.data.length, 'roles');
    // Permission: user cannot access admin
    try {
      await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${users.user.token}` } });
      console.error('❌ User accessed admin page!');
    } catch (err: any) {
      console.log('✅ User cannot access admin:', err.response?.data?.message);
    }
  } catch (err: any) {
    console.error('❌ Admin workflow error:', err.response?.data || err.message);
  }

  // 5. Filter, Search, Pagination, Export (ตัวอย่าง)
  try {
    const list = await axios.get(`${API}/timesheets`, { headers: { Authorization: `Bearer ${users.admin.token}` }, params: { status: 'approved', limit: 5, page: 1 } });
    console.log('✅ List approved timesheets:', list.data.data.length);
    // Search
    const search = await axios.get(`${API}/timesheets`, { headers: { Authorization: `Bearer ${users.admin.token}` }, params: { search: activity } });
    console.log('✅ Search timesheet:', search.data.data.length);
    // Pagination
    const page2 = await axios.get(`${API}/timesheets`, { headers: { Authorization: `Bearer ${users.admin.token}` }, params: { page: 2, limit: 5 } });
    console.log('✅ Pagination page 2:', page2.data.data.length);
    // Export (ถ้ามี endpoint)
    // const exportRes = await axios.get(`${API}/report/export`, { headers: { Authorization: `Bearer ${users.admin.token}` } });
    // console.log('✅ Export report:', exportRes.status);
  } catch (err: any) {
    console.error('❌ List/search/pagination/export error:', err.response?.data || err.message);
  }

  console.log('🎉 Integration API workflow test completed.');
}

run(); 