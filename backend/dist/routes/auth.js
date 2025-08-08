"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', authController_1.validateRegister, authController_1.register);
router.post('/login', authController_1.validateLogin, authController_1.login);
router.post('/forgot-password', authController_1.forgotPassword);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.patch('/profile', auth_1.authenticate, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map