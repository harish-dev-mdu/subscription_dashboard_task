const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response.utils');
const crypto = require('crypto');

const createSubscriptionOrder = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return errorResponse(res, 'Plan not found', 404);
    }

    const existingSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (existingSubscription) {
      return errorResponse(res, 'You already have an active subscription', 400);
    }

    const amount = plan.price * 100;
    const currency = plan.currency || 'INR';
    const orderId = `order_${crypto.randomBytes(16).toString('hex')}`;

    const subscription = await Subscription.create({
      userId,
      planId,
      startDate: new Date(),
      endDate: calculateEndDate(plan),
      status: 'pending',
      orderId,
      amount: plan.price,
      currency,
      paymentMethod: 'razorpay'
    });

    return successResponse(res, {
      subscription,
      orderId,
      amount,
      currency,
      planName: plan.name,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }, 'Subscription order created', 201);

  } catch (error) {
    console.error('Create subscription error:', error);
    return errorResponse(res, 'Failed to create subscription', 500);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ orderId, userId });

    if (!subscription) {
      return errorResponse(res, 'Subscription not found', 404);
    }

    if (subscription.status === 'active') {
      return errorResponse(res, 'Subscription already activated', 400);
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (signature === expectedSignature || process.env.NODE_ENV === 'development') {
      subscription.paymentId = paymentId;
      subscription.status = 'active';
      await subscription.save();

      await subscription.populate('planId', 'name price duration features');

      return successResponse(res, {
        subscription,
        plan: subscription.planId
      }, 'Payment verified and subscription activated');
    } else {
      subscription.status = 'cancelled';
      await subscription.save();
      return errorResponse(res, 'Payment verification failed', 400);
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    return errorResponse(res, 'Failed to verify payment', 500);
  }
};

const upgradeSubscription = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id;

    // New plan check
    const newPlan = await Plan.findById(planId);
    if (!newPlan) {
      return errorResponse(res, 'Plan not found', 404);
    }

    // Current active subscription
    const currentSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('planId');

    if (!currentSubscription) {
      return errorResponse(res, 'No active subscription found', 404);
    }

    const currentPlan = currentSubscription.planId;

    if (currentPlan._id.toString() === planId) {
      return errorResponse(res, 'You are already on this plan', 400);
    }

    // Cancel current subscription
    currentSubscription.status = 'cancelled';
    currentSubscription.cancelledAt = new Date();
    currentSubscription.cancellationReason = `Switched to ${newPlan.name}`;
    currentSubscription.autoRenew = false;
    await currentSubscription.save();

    // Create new subscription
    const orderId = `order_${crypto.randomBytes(16).toString('hex')}`;

    const newSubscription = await Subscription.create({
      userId,
      planId,
      startDate: new Date(),
      endDate: calculateEndDate(newPlan),
      status: 'active',
      orderId,
      paymentId: `upgrade_${Date.now()}`,
      amount: newPlan.price,
      currency: newPlan.currency || 'INR',
      paymentMethod: 'razorpay'
    });

    await newSubscription.populate('planId', 'name price duration durationUnit features');

    const isUpgrade = newPlan.price > currentPlan.price;

    return successResponse(res, {
      subscription: newSubscription,
      plan: newSubscription.planId,
      action: isUpgrade ? 'upgraded' : 'downgraded'
    }, `Successfully ${isUpgrade ? 'upgraded' : 'downgraded'} to ${newPlan.name}`);

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return errorResponse(res, 'Failed to upgrade subscription', 500);
  }
};

const getMySubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    // Auto-expire subscriptions
    await Subscription.updateMany(
      { status: 'active', endDate: { $lt: new Date() } },
      { status: 'expired' }
    );

    const currentSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    })
      .populate('planId', 'name price duration durationUnit features formattedDuration')
      .sort({ createdAt: -1 });

    const subscriptionHistory = await Subscription.find({ userId })
      .populate('planId', 'name price duration durationUnit')
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, {
      currentSubscription,
      subscriptionHistory
    }, 'Subscription retrieved successfully');

  } catch (error) {
    console.error('Get subscription error:', error);
    return errorResponse(res, 'Failed to retrieve subscription', 500);
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({
      userId,
      status: 'active'
    });

    if (!subscription) {
      return errorResponse(res, 'No active subscription found', 404);
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || 'User cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    return successResponse(res, { subscription }, 'Subscription cancelled successfully');

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return errorResponse(res, 'Failed to cancel subscription', 500);
  }
};

const calculateEndDate = (plan) => {
  const startDate = new Date();
  let endDate;

  switch (plan.durationUnit) {
    case 'minutes':
      endDate = new Date(startDate.getTime() + plan.duration * 60 * 1000);
      break;
    case 'hours':
      endDate = new Date(startDate.getTime() + plan.duration * 60 * 60 * 1000);
      break;
    case 'days':
      endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
      break;
    case 'months':
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.duration);
      break;
    case 'years':
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + plan.duration);
      break;
    default:
      endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
  }

  return endDate;
};

module.exports = {
  createSubscriptionOrder,
  verifyPayment,
  upgradeSubscription,
  getMySubscription,
  cancelSubscription
};