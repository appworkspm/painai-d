"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:8000/api';
async function login(email, password) {
    const res = await axios_1.default.post(`${API_URL}/auth/login`, { email, password });
    return res.data.data.token;
}
async function main() {
    try {
        const adminToken = await login('admin@painai.com', 'admin123');
        const managerToken = await login('manager@painai.com', 'manager123');
        const userToken = await login('user@painai.com', 'user123');
        console.log('✅ Login success (admin, manager, user)');
        let newTimesheetId = '';
        try {
            const createRes = await axios_1.default.post(`${API_URL}/timesheets`, {
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
        }
        catch (err) {
            console.error('❌ Create timesheet error:', err.response?.data || err.message);
        }
        try {
            const editRes = await axios_1.default.put(`${API_URL}/timesheets/${newTimesheetId}`, {
                description: 'API test edit',
                hours_worked: 3
            }, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log('✅ User edited timesheet:', editRes.data.timesheet.id);
        }
        catch (err) {
            console.error('❌ Edit timesheet error:', err.response?.data || err.message);
        }
        try {
            const submitRes = await axios_1.default.patch(`${API_URL}/timesheets/${newTimesheetId}/submit`, {}, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log('✅ User submitted timesheet:', submitRes.data.timesheet.id);
        }
        catch (err) {
            console.error('❌ Submit timesheet error:', err.response?.data || err.message);
        }
        try {
            const approveRes = await axios_1.default.patch(`${API_URL}/timesheets/${newTimesheetId}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${managerToken}` } });
            console.log('✅ Manager approved timesheet:', approveRes.data.timesheet.id);
        }
        catch (err) {
            console.error('❌ Approve timesheet error:', err.response?.data || err.message);
        }
        try {
            const allRes = await axios_1.default.get(`${API_URL}/timesheets`, { headers: { Authorization: `Bearer ${managerToken}` } });
            const submitted = allRes.data.data.find((t) => t.status === 'submitted' && t.id !== newTimesheetId);
            if (submitted) {
                const rejectRes = await axios_1.default.patch(`${API_URL}/timesheets/${submitted.id}/approve`, { status: 'rejected', rejection_reason: 'Test reject' }, { headers: { Authorization: `Bearer ${managerToken}` } });
                console.log('✅ Manager rejected timesheet:', rejectRes.data.timesheet.id);
            }
            else {
                console.log('❗ No other submitted timesheet to reject');
            }
        }
        catch (err) {
            console.error('❌ Reject timesheet error:', err.response?.data || err.message);
        }
        try {
            await axios_1.default.patch(`${API_URL}/timesheets/${newTimesheetId}/approve`, { status: 'approved' }, { headers: { Authorization: `Bearer ${userToken}` } });
            console.error('❌ User should not be able to approve timesheet!');
        }
        catch (err) {
            console.log('✅ User cannot approve timesheet (expected):', err.response?.data?.message || err.message);
        }
        let draftId = '';
        try {
            const createDraft = await axios_1.default.post(`${API_URL}/timesheets`, {
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
            const delRes = await axios_1.default.delete(`${API_URL}/timesheets/${draftId}`, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log('✅ User deleted draft timesheet:', draftId);
        }
        catch (err) {
            console.error('❌ Delete draft timesheet error:', err.response?.data || err.message);
        }
        try {
            const historyRes = await axios_1.default.get(`${API_URL}/timesheets/${newTimesheetId}/history`, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log('🕓 Timesheet history:', historyRes.data.data.map((h) => ({ action: h.action, user: h.user?.email, at: h.createdAt })));
        }
        catch (err) {
            console.error('❌ Get timesheet history error:', err.response?.data || err.message);
        }
        try {
            const myRes = await axios_1.default.get(`${API_URL}/timesheets/my`, { headers: { Authorization: `Bearer ${userToken}` } });
            console.log('📄 User timesheets:', myRes.data.data.map((t) => ({ id: t.id, status: t.status })));
        }
        catch (err) {
            console.error('❌ Get my timesheets error:', err.response?.data || err.message);
        }
        try {
            const allRes = await axios_1.default.get(`${API_URL}/timesheets`, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('📄 Admin sees all timesheets:', allRes.data.data.map((t) => ({ id: t.id, status: t.status })));
        }
        catch (err) {
            console.error('❌ Admin get all timesheets error:', err.response?.data || err.message);
        }
    }
    catch (err) {
        console.error('❌ Test failed:', err.response?.data || err.message);
    }
}
main();
//# sourceMappingURL=test-api.js.map