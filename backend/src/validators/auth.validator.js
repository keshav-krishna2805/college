import { body } from 'express-validator';

export const studentRegisterValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
    .withMessage('Password must be at least 8 chars with uppercase, lowercase, and number'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('branch').notEmpty().withMessage('Branch is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('year').isNumeric().withMessage('Year must be a number'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
