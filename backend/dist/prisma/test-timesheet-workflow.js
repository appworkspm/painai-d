"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API = 'https://painai.onrender.com/api';
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU2ZTJkNzE2LWZhZWUtNDJiYi1hYmJiLTljMGQwNGNmYmI2NCIsImVtYWlsIjoibmF3aW4uYnVAYXBwd29ya3MuY28udGgiLCJyb2xlIjoiVVNFUiIsIm5hbWUiOiJOYXdpbiBCdW5qb3B1dHNhIiwiaWF0IjoxNzUyNjYyMTM2LCJleHAiOjE3NTMyNjY5MzZ9.tJpzcXvl1cR5VwPungOC_4Gtbhsp5qHQGhTlYLcRxZ4';
const managerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNjNGQwYTY2LTU5ODQtNDU5Zi05MmQ4LTMyZDQ1NjNiZjlmMSIsImVtYWlsIjoicHJhdHlhLmZ1QGFwcHdvcmtzLmNvLnRoIiwicm9sZSI6Ik1BTkFHRVIiLCJuYW1lIjoiUHJhdHlhIEZ1ZnVlbmciLCJpYXQiOjE3NTI2NjIwNjMsImV4cCI6MTc1MzI2Njg2M30.tl01G3IPERPCIrNpWTERN_3Rn7f1H332JAY7vKC4EYo';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkZmMyZTFiLTBkNWYtNDBlMi05OWNhLTA3MjFlYTVlYzhkYyIsImVtYWlsIjoiamFrZ3JpdHMucGhAYXBwd29ya3MuY28udGgiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiSmFrZ3JpdHMgUGhvb25nZW4iLCJpYXQiOjE3NTI2NjE1MDMsImV4cCI6MTc1MzI2NjMwM30.LlpZ4rwOgSWQup9nC5Tg1bUY9IsQB_GwcgYvX_fy8hw';
function getRandomFutureDate(days = 10) {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * days));
    return d.toISOString().split('T')[0];
}
function getRandomActivity() {
    return 'TEST_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
async function run() {
    try {
        const randomDate1 = getRandomFutureDate();
        const randomActivity1 = getRandomActivity();
        const randomDate2 = getRandomFutureDate();
        const randomActivity2 = getRandomActivity();
        const createRes = await axios_1.default.post(`${API}/timesheets`, {
            activity: randomActivity1,
            date: randomDate1,
            hours_worked: 2,
            description: 'Test workflow',
            work_type: 'PROJECT',
            status: 'draft',
        }, { headers: { Authorization: `Bearer ${userToken}` } });
        const timesheetId = createRes.data.timesheet.id;
        console.log('✅ Created draft timesheet:', timesheetId);
        await axios_1.default.patch(`${API}/timesheets/${timesheetId}/submit`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
        console.log('✅ Submitted timesheet');
        await axios_1.default.patch(`${API}/timesheets/${timesheetId}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${managerToken}` } });
        console.log('✅ Approved timesheet');
        const createRes2 = await axios_1.default.post(`${API}/timesheets`, {
            activity: randomActivity2,
            date: randomDate2,
            hours_worked: 1,
            description: 'Test reject',
            work_type: 'PROJECT',
            status: 'draft',
        }, { headers: { Authorization: `Bearer ${userToken}` } });
        const timesheetId2 = createRes2.data.timesheet.id;
        await axios_1.default.patch(`${API}/timesheets/${timesheetId2}/submit`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
        await axios_1.default.patch(`${API}/timesheets/${timesheetId2}/reject`, { rejection_reason: 'Test auto reject' }, { headers: { Authorization: `Bearer ${managerToken}` } });
        console.log('✅ Rejected timesheet');
        const myTimesheets = await axios_1.default.get(`${API}/timesheets/my`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('My Timesheets:', myTimesheets.data.data.map((t) => ({ id: t.id, status: t.status })));
        const approvalList = await axios_1.default.get(`${API}/timesheets`, {
            params: { status: 'submitted' },
            headers: { Authorization: `Bearer ${managerToken}` }
        });
        console.log('Pending Approval:', approvalList.data.data.map((t) => ({ id: t.id, status: t.status })));
        const approvedList = await axios_1.default.get(`${API}/timesheets`, {
            params: { status: 'approved' },
            headers: { Authorization: `Bearer ${managerToken}` }
        });
        console.log('Approved List:', approvedList.data.data.map((t) => ({ id: t.id, status: t.status })));
        const rejectedList = await axios_1.default.get(`${API}/timesheets`, {
            params: { status: 'rejected' },
            headers: { Authorization: `Bearer ${managerToken}` }
        });
        console.log('Rejected List:', rejectedList.data.data.map((t) => ({ id: t.id, status: t.status })));
        console.log('✅ Workflow test completed.');
    }
    catch (err) {
        console.error('❌ Workflow test failed:', err.response?.data || err.message);
    }
}
run();
//# sourceMappingURL=test-timesheet-workflow.js.map