import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

async function login(email: string, password: string) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data.data.token;
}

async function main() {
  try {
    // 1. Login as admin, manager, user
    const adminToken = await login('admin@painai.com', 'admin123');
    const managerToken = await login('manager@painai.com', 'manager123');
    const userToken = await login('user@painai.com', 'user123');
    console.log('✅ Login success (admin, manager, user)');

    // 2. User creates a new timesheet (draft)
    let newTimesheetId = '';
    try {
      const createRes = await axios.post(`${API_URL}/timesheets`, {
        project_id: null,
        work_type: 'NON_PROJECT',
        sub_work_type: 'OTHER',
        activity: 'Test Activity',
        date: new Date().toISOString().slice(0, 10),
        hours_worked: 2,
        overtime_hours: 0,
        description: 'API test create',
        billable: false,
        hourly_rate: 0,
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      newTimesheetId = createRes.data.timesheet.id;
      console.log('✅ User created timesheet:', newTimesheetId);
    } catch (err: any) {
      console.error('❌ Create timesheet error:', err.response?.data || err.message);
    }

    // 3. User edits the timesheet
    try {
      const editRes = await axios.put(`${API_URL}/timesheets/${newTimesheetId}`, {
        description: 'API test edit',
        hours_worked: 3
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      console.log('✅ User edited timesheet:', editRes.data.timesheet.id);
    } catch (err: any) {
      console.error('❌ Edit timesheet error:', err.response?.data || err.message);
    }

    // 4. User submits the timesheet
    try {
      const submitRes = await axios.patch(`${API_URL}/timesheets/${newTimesheetId}/submit`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
      console.log('✅ User submitted timesheet:', submitRes.data.timesheet.id);
    } catch (err: any) {
      console.error('❌ Submit timesheet error:', err.response?.data || err.message);
    }

    // 5. Manager approves the timesheet
    try {
      const approveRes = await axios.patch(`${API_URL}/timesheets/${newTimesheetId}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${managerToken}` } });
      console.log('✅ Manager approved timesheet:', approveRes.data.timesheet.id);
    } catch (err: any) {
      console.error('❌ Approve timesheet error:', err.response?.data || err.message);
    }

    // 6. Manager rejects another timesheet (if any submitted)
    try {
      const allRes = await axios.get(`${API_URL}/timesheets`, { headers: { Authorization: `Bearer ${managerToken}` } });
      const submitted = allRes.data.data.find((t: any) => t.status === 'submitted' && t.id !== newTimesheetId);
      if (submitted) {
        const rejectRes = await axios.patch(`${API_URL}/timesheets/${submitted.id}/approve`, { status: 'rejected', rejection_reason: 'Test reject' }, { headers: { Authorization: `Bearer ${managerToken}` } });
        console.log('✅ Manager rejected timesheet:', rejectRes.data.timesheet.id);
      } else {
        console.log('❗ No other submitted timesheet to reject');
      }
    } catch (err: any) {
      console.error('❌ Reject timesheet error:', err.response?.data || err.message);
    }

    // 7. User tries to approve (should fail)
    try {
      await axios.patch(`${API_URL}/timesheets/${newTimesheetId}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${userToken}` } });
      console.error('❌ User should not be able to approve timesheet!');
    } catch (err: any) {
      console.log('✅ User cannot approve timesheet (expected):', err.response?.data?.message || err.message);
    }

    // 8. User deletes a draft timesheet (create new draft first)
    let draftId = '';
    try {
      const createDraft = await axios.post(`${API_URL}/timesheets`, {
        project_id: null,
        work_type: 'NON_PROJECT',
        sub_work_type: 'OTHER',
        activity: 'Draft',
        date: new Date().toISOString().slice(0, 10),
        hours_worked: 1,
        overtime_hours: 0,
        description: 'Draft to delete',
        billable: false,
        hourly_rate: 0,
      }, { headers: { Authorization: `Bearer ${userToken}` } });
      draftId = createDraft.data.timesheet.id;
      const delRes = await axios.delete(`${API_URL}/timesheets/${draftId}`, { headers: { Authorization: `Bearer ${userToken}` } });
      console.log('✅ User deleted draft timesheet:', draftId);
    } catch (err: any) {
      console.error('❌ Delete draft timesheet error:', err.response?.data || err.message);
    }

    // 9. Get history of the main timesheet
    try {
      const historyRes = await axios.get(`${API_URL}/timesheets/${newTimesheetId}/history`, { headers: { Authorization: `Bearer ${userToken}` } });
      console.log('🕓 Timesheet history:', historyRes.data.data.map((h: any) => ({ action: h.action, user: h.user?.email, at: h.createdAt })));
    } catch (err: any) {
      console.error('❌ Get timesheet history error:', err.response?.data || err.message);
    }

    // 10. User gets their own timesheets
    try {
      const myRes = await axios.get(`${API_URL}/timesheets/my`, { headers: { Authorization: `Bearer ${userToken}` } });
      console.log('📄 User timesheets:', myRes.data.data.map((t: any) => ({ id: t.id, status: t.status })));
    } catch (err: any) {
      console.error('❌ Get my timesheets error:', err.response?.data || err.message);
    }

    // 11. Admin gets all timesheets
    try {
      const allRes = await axios.get(`${API_URL}/timesheets`, { headers: { Authorization: `Bearer ${adminToken}` } });
      console.log('📄 Admin sees all timesheets:', allRes.data.data.map((t: any) => ({ id: t.id, status: t.status })));
    } catch (err: any) {
      console.error('❌ Admin get all timesheets error:', err.response?.data || err.message);
    }
  } catch (err: any) {
    console.error('❌ Test failed:', err.response?.data || err.message);
  }
}

main(); 