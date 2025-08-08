"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const timesheetController_1 = require("../controllers/timesheetController");
const router = (0, express_1.Router)();
router.get('/my', auth_1.requireAuth, timesheetController_1.getMyTimesheets);
router.get('/history', auth_1.requireAuth, timesheetController_1.getUserTimesheetHistory);
router.get('/pending', auth_1.requireAuth, timesheetController_1.getPendingTimesheets);
router.get('/', auth_1.requireAuth, auth_1.requireManager, timesheetController_1.getAllTimesheets);
router.post('/', auth_1.requireAuth, timesheetController_1.createTimesheet);
router.put('/:id', auth_1.requireAuth, timesheetController_1.updateTimesheet);
router.delete('/:id', auth_1.requireAuth, timesheetController_1.deleteTimesheet);
router.get('/:id/history', auth_1.requireAuth, timesheetController_1.getTimesheetHistory);
router.patch('/:id/submit', auth_1.requireAuth, timesheetController_1.submitTimesheet);
router.patch('/:id/approve', auth_1.requireAuth, timesheetController_1.approveTimesheet);
router.patch('/:id/reject', auth_1.requireAuth, timesheetController_1.rejectTimesheet);
exports.default = router;
//# sourceMappingURL=timesheets.js.map