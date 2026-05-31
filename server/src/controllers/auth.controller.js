const User = require('../models/User');
const { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validations/auth.validation');
const { generateTokens, setTokenCookies, clearTokenCookies, verifyRefreshToken } = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const validation = registerSchema.safeParse({ body: req.body });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path[err.path.length - 1],
        message: err.message
      }));
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: email === 'admin@gmail.com' ? 'admin' : 'user'
    });

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    return successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      accessToken
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Failed to register user', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validation = loginSchema.safeParse({ body: req.body });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path[err.path.length - 1],
        message: err.message
      }));
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    return successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      accessToken
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Failed to login', 500);
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshTokenFromBody = req.body.refreshToken;
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    const token = refreshTokenFromBody || refreshTokenFromCookie;

    if (!token) {
      return errorResponse(res, 'Refresh token required', 401);
    }

    const user = await verifyRefreshToken(token);
    if (!user) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    setTokenCookies(res, accessToken, newRefreshToken);

    return successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Failed to refresh token', 500);
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    clearTokenCookies(res);

    return successResponse(res, null, 'Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Failed to logout', 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'User retrieved successfully');

  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, 'Failed to get user', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const validation = updateProfileSchema.safeParse({ body: req.body });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path[err.path.length - 1],
        message: err.message
      }));
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const { name, email } = req.body;
    const userId = req.user._id;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return errorResponse(res, 'Email already in use', 409);
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    return successResponse(res, { user }, 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const validation = changePasswordSchema.safeParse({ body: req.body });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path[err.path.length - 1],
        message: err.message
      }));
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, null, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Failed to change password', 500);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword
};
