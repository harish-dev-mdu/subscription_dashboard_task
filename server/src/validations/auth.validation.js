const { z } = require('zod');

// const registerSchema = z.object({
//   body: z.object({
//     name: z
//       .string()
//       .trim()
//       .min(2, 'Name must be at least 2 characters')
//       .max(50, 'Name cannot exceed 50 characters'),
//     email: z
//       .string()
//       .trim()
//       .email('Invalid email address')
//       .transform(val => val.toLowerCase()),
//     password: z
//       .string()
//       .min(6, 'Password must be at least 6 characters')
//       .max(100, 'Password cannot exceed 100 characters'),
//     confirmPassword: z
//       .string()
//       .min(6, 'Password must be at least 6 characters')
//   }).refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ['confirmPassword']
//   })
// });


const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform(val => val.toLowerCase()),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional()
  }).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })
});
const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform(val => val.toLowerCase()),
    password: z
      .string()
      .min(1, 'Password is required')
  })
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  }).or(
    z.object({
      cookies: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required')
      })
    })
  )
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform(val => val.toLowerCase())
      .optional()
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema
};