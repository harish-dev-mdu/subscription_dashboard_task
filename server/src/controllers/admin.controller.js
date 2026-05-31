const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Plan = require('../models/Plan');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

const getAllSubscriptions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitInt = parseInt(limit);

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    let userQuery = {};
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    let userIds = [];
    if (search) {
      const users = await User.find(userQuery).select('_id');
      userIds = users.map(u => u._id);
      if (userIds.length === 0) {
        return paginatedResponse(res, [], parseInt(page), limitInt, 0, 'Subscriptions retrieved');
      }
      query.userId = { $in: userIds };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name email role')
      .populate('planId', 'name price duration durationUnit')
      .sort(sort)
      .skip(skip)
      // .limit(limitInt);Expired Subscriptions
      .limit(limitInt);
    const total = await Subscription.countDocuments(query);

    return paginatedResponse(res, subscriptions, parseInt(page), limitInt, total, 'Subscriptions retrieved');

  } catch (error) {
    console.error('Get all subscriptions error:', error);
    return errorResponse(res, 'Failed to retrieve subscriptions', 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return paginatedResponse(res, users, parseInt(page), parseInt(limit), total, 'Users retrieved');

  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 'Failed to retrieve users', 500);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPlans,
      activeSubscriptions,
      expiredSubscriptions,
      pendingSubscriptions,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Plan.countDocuments({ isActive: true }),
      Subscription.countDocuments({ status: 'active', endDate: { $gt: new Date() } }),
      // Subscription.countDocuments({ status: 'expired' }),
      Subscription.countDocuments({ 
  $or: [
    { status: 'expired' },
    { status: 'active', endDate: { $lt: new Date() } }
  ]
}),
      Subscription.countDocuments({ status: 'pending' }),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const recentSubscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    const subscriptionsByPlan = await Subscription.aggregate([
      {
        $group: {
          _id: '$planId',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: '_id',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
      },
      {
        $project: {
          planName: '$plan.name',
          count: 1,
          revenue: 1
        }
      }
    ]);

    return successResponse(res, {
      stats: {
        totalUsers,
        totalPlans,
        activeSubscriptions,
        expiredSubscriptions,
        pendingSubscriptions,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      },
      recentSubscriptions,
      subscriptionsByPlan
    }, 'Dashboard stats retrieved');

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to retrieve stats', 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await Subscription.deleteMany({ userId: id });

    return successResponse(res, null, 'User deleted successfully');

  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password -refreshToken');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'User role updated');

  } catch (error) {
    console.error('Update user role error:', error);
    return errorResponse(res, 'Failed to update user role', 500);
  }
};

module.exports = {
  getAllSubscriptions,
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole
};
