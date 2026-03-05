const { body } = require('express-validator');

const registerValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters and spaces'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  body('agreeTerms')
    .isBoolean().withMessage('Must agree to terms')
    .custom(value => value === true).withMessage('You must agree to the terms and conditions')
];

const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];

const verifyEmailValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('code')
    .notEmpty().withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
    .isNumeric().withMessage('Verification code must be numeric')
];

const createEmployeeValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('phone')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'receptionist', 'cashier', 'designer', 'printer'])
    .withMessage('Invalid role selected'),

  body('department')
    .notEmpty().withMessage('Department is required'),

  body('position')
    .notEmpty().withMessage('Position is required'),

  body('hireDate')
    .notEmpty().withMessage('Hire date is required')
    .isDate().withMessage('Invalid date format'),

  body('salary')
    .optional()
    .isNumeric().withMessage('Salary must be a number')
    .isFloat({ min: 0 }).withMessage('Salary must be positive'),

  body('emergencyContactName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Emergency contact name must be between 2 and 100 characters'),

  body('emergencyContactPhone')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please enter a valid phone number')
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  createEmployeeValidation
};