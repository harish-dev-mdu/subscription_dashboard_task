const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlanById);
router.post('/', protect, authorize('admin'), planController.createPlan);
router.put('/:id', protect, authorize('admin'), planController.updatePlan);
router.delete('/:id', protect, authorize('admin'), planController.deletePlan);

module.exports = router;
