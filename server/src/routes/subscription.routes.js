const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/verify', protect, subscriptionController.verifyPayment);
router.post('/upgrade/:planId', protect, subscriptionController.upgradeSubscription);
router.post('/:planId', protect, subscriptionController.createSubscriptionOrder);
router.get('/me', protect, subscriptionController.getMySubscription);
router.delete('/cancel', protect, subscriptionController.cancelSubscription);

module.exports = router;