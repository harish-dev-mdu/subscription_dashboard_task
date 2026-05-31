const Plan = require('../models/Plan');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .sort({ price: 1 });

    return successResponse(res, { plans }, 'Plans retrieved successfully');

  } catch (error) {
    console.error('Get plans error:', error);
    return errorResponse(res, 'Failed to retrieve plans', 500);
  }
};

const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);

    if (!plan) {
      return errorResponse(res, 'Plan not found', 404);
    }

    return successResponse(res, { plan }, 'Plan retrieved successfully');

  } catch (error) {
    console.error('Get plan error:', error);
    return errorResponse(res, 'Failed to retrieve plan', 500);
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, price, currency, duration, durationUnit, features, maxUsers, maxProjects, storageLimit } = req.body;

    const plan = await Plan.create({
      name,
      price,
      currency: currency || 'INR',
      duration,
      durationUnit: durationUnit || 'days',
      features: features || [],
      maxUsers: maxUsers || 1,
      maxProjects: maxProjects || 1,
      storageLimit: storageLimit || 100
    });

    return successResponse(res, { plan }, 'Plan created successfully', 201);

  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'Plan with this name already exists', 409);
    }
    console.error('Create plan error:', error);
    return errorResponse(res, 'Failed to create plan', 500);
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await Plan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return errorResponse(res, 'Plan not found', 404);
    }

    return successResponse(res, { plan }, 'Plan updated successfully');

  } catch (error) {
    console.error('Update plan error:', error);
    return errorResponse(res, 'Failed to update plan', 500);
  }
};

const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      return errorResponse(res, 'Plan not found', 404);
    }

    plan.isActive = false;
    await plan.save();

    return successResponse(res, null, 'Plan deactivated successfully');

  } catch (error) {
    console.error('Delete plan error:', error);
    return errorResponse(res, 'Failed to delete plan', 500);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};
