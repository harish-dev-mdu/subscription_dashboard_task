const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/subscriptions', protect, authorize('admin'), adminController.getAllSubscriptions);
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.get('/stats', protect, authorize('admin'), adminController.getDashboardStats);
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);
router.put('/users/:id/role', protect, authorize('admin'), adminController.updateUserRole);

module.exports = router;
