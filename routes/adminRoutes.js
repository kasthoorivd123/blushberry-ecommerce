const express            = require('express')
const adminRouter        = express.Router()
const adminController    = require('../controllers/admin/adminController')
const customerController = require('../controllers/admin/customerController')
const adminAuth          = require('../middleware/adminAuth')

// ── Auth ──────────────────────────────────────────────────────────
adminRouter.get('/login',     adminController.loadAdminLogin)
adminRouter.post('/login',    adminController.adminLogin)
adminRouter.get('/dashboard', adminAuth, adminController.loadDashboard)

// ── Customer Management ───────────────────────────────────────────
// Handles search (ii), pagination (iii), sort latest first (iv)
adminRouter.get('/customers',adminAuth, customerController.loadCustomer)

// i. Block & Unblock — called via AJAX after frontend confirmation dialog
adminRouter.post('/customers/block/:id',   adminAuth, customerController.blockUser)
adminRouter.post('/customers/unblock/:id', adminAuth, customerController.unblockUser)

adminRouter.get('/logout',adminAuth,adminController.adminLogout)
module.exports = adminRouter;