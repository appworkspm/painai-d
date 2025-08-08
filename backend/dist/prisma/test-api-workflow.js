"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
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
const roles = ['admin', 'manager', 'user'];
function getRandomActivity() {
    return 'E2E_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
function getRandomDate() {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * 10));
    return d.toISOString().split('T')[0];
}
async function loginAndGetToken(email, password) {
    try {
        const res = await axios_1.default.post(`${API}/auth/login`, { email, password });
        return res.data.token;
    }
    catch (err) {
        console.error(`❌ Login failed for ${email}:`, err.response?.data || err.message);
        return '';
    }
}
async function run() {
    for (const role of roles) {
        users[role].token = await loginAndGetToken(users[role].email, users[role].password);
    }
    if (!users.user.token || !users.manager.token || !users.admin.token) {
        console.error('❌ Login failed for one or more roles.');
        return;
    }
    const activity = getRandomActivity();
    const date = getRandomDate();
    let timesheetId = '';
    try {
        const createRes = await axios_1.default.post(`${API}/timesheets`, {
            activity,
            date,
            hours_worked: 2,
            description: 'E2E API test',
            work_type: 'PROJECT',
            status: 'draft',
        }, { headers: { Authorization: `Bearer ${users.user.token}` } });
        timesheetId = createRes.data.timesheet.id;
        console.log('✅ User created timesheet:', timesheetId);
        try {
            await axios_1.default.post(`${API}/timesheets`, {
                activity: getRandomActivity(),
                date,
                hours_worked: 1,
                description: 'Duplicate date',
                work_type: 'PROJECT',
                status: 'draft',
            }, { headers: { Authorization: `Bearer ${users.user.token}` } });
            console.error('❌ Duplicate timesheet allowed!');
        }
        catch (err) {
            console.log('✅ Duplicate timesheet blocked:', err.response?.data?.message);
        }
        await axios_1.default.put(`${API}/timesheets/${timesheetId}`, { description: 'E2E API test (edited)' }, { headers: { Authorization: `Bearer ${users.user.token}` } });
        console.log('✅ User edited timesheet');
        await axios_1.default.patch(`${API}/timesheets/${timesheetId}/submit`, {}, { headers: { Authorization: `Bearer ${users.user.token}` } });
        console.log('✅ User submitted timesheet');
        try {
            await axios_1.default.patch(`${API}/timesheets/${timesheetId}/submit`, {}, { headers: { Authorization: `Bearer ${users.user.token}` } });
            console.error('❌ Submit already submitted timesheet allowed!');
        }
        catch (err) {
            console.log('✅ Submit already submitted timesheet blocked:', err.response?.data?.message);
        }
        try {
            await axios_1.default.delete(`${API}/timesheets/${timesheetId}`, { headers: { Authorization: `Bearer ${users.user.token}` } });
            console.error('❌ Delete submitted timesheet allowed!');
        }
        catch (err) {
            console.log('✅ Delete submitted timesheet blocked:', err.response?.data?.message);
        }
    }
    catch (err) {
        console.error('❌ User workflow error:', err.response?.data || err.message);
    }
    try {
        await axios_1.default.patch(`${API}/timesheets/${timesheetId}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${users.manager.token}` } });
        console.log('✅ Manager approved timesheet');
        const activity2 = getRandomActivity();
        const date2 = getRandomDate();
        const createRes2 = await axios_1.default.post(`${API}/timesheets`, {
            activity: activity2,
            date: date2,
            hours_worked: 1,
            description: 'E2E API test reject',
            work_type: 'PROJECT',
            status: 'draft',
        }, { headers: { Authorization: `Bearer ${users.user.token}` } });
        const timesheetId2 = createRes2.data.timesheet.id;
        await axios_1.default.patch(`${API}/timesheets/${timesheetId2}/submit`, {}, { headers: { Authorization: `Bearer ${users.user.token}` } });
        await axios_1.default.patch(`${API}/timesheets/${timesheetId2}/reject`, { rejection_reason: 'E2E reject' }, { headers: { Authorization: `Bearer ${users.manager.token}` } });
        console.log('✅ Manager rejected timesheet');
        try {
            await axios_1.default.patch(`${API}/timesheets/${timesheetId2}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${users.user.token}` } });
            console.error('❌ User can approve timesheet!');
        }
        catch (err) {
            console.log('✅ User cannot approve timesheet:', err.response?.data?.message);
        }
    }
    catch (err) {
        console.error('❌ Manager workflow error:', err.response?.data || err.message);
    }
    try {
        const usersRes = await axios_1.default.get(`${API}/users`, { headers: { Authorization: `Bearer ${users.admin.token}` } });
        console.log('✅ Admin accessed users:', usersRes.data.data.length, 'users');
        const rolesRes = await axios_1.default.get(`${API}/users/roles`, { headers: { Authorization: `Bearer ${users.admin.token}` } });
        console.log('✅ Admin accessed roles:', rolesRes.data.data.length, 'roles');
        try {
            await axios_1.default.get(`${API}/users`, { headers: { Authorization: `Bearer ${users.user.token}` } });
            console.error('❌ User accessed admin page!');
        }
        catch (err) {
            console.log('✅ User cannot access admin:', err.response?.data?.message);
        }
    }
    catch (err) {
        console.error('❌ Admin workflow error:', err.response?.data || err.message);
    }
    try {
        const list = await axios_1.default.get(`${API}/timesheets`, { headers: { Authorization: `Bearer ${users.admin.token}` }, params: { status: 'approved', limit: 5, page: 1 } });
        console.log('✅ List approved timesheets:', list.data.data.length);
        const search = await axios_1.default.get(`${API}/timesheets`, { headers: { Authorization: `Bearer ${users.admin.token}` }, params: { search: activity } });
        console.log('✅ Search timesheet:', search.data.data.length);
        const page2 = await axios_1.default.get(`${API}/timesheets`, { headers: { Authorization: `Bearer ${users.admin.token}` }, params: { page: 2, limit: 5 } });
        console.log('✅ Pagination page 2:', page2.data.data.length);
    }
    catch (err) {
        console.error('❌ List/search/pagination/export error:', err.response?.data || err.message);
    }
    console.log('🎉 Integration API workflow test completed.');
}
run();
//# sourceMappingURL=test-api-workflow.js.map