import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Будь ласка, введіть коректну email адресу',
      'any.required': 'Email є обов\'язковим полем'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Пароль повинен містити щонайменше 8 символів',
      'string.max': 'Пароль не може бути довшим за 128 символів',
      'string.pattern.base': 'Пароль повинен містити щонайменше одну малу літеру, одну велику літеру та одну цифру',
      'any.required': 'Пароль є обов\'язковим полем'
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[А-Яа-яІіЇїЄє'`-\s]+$/)
    .required()
    .messages({
      'string.min': 'Ім\'я повинно містити щонайменше 2 символи',
      'string.max': 'Ім\'я не може бути довшим за 50 символів',
      'string.pattern.base': 'Ім\'я може містити лише українські літери, апостроф, дефіс та пробіли',
      'any.required': 'Ім\'я є обов\'язковим полем'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[А-Яа-яІіЇїЄє'`-\s]+$/)
    .required()
    .messages({
      'string.min': 'Прізвище повинно містити щонайменше 2 символи',
      'string.max': 'Прізвище не може бути довшим за 50 символів',
      'string.pattern.base': 'Прізвище може містити лише українські літери, апостроф, дефіс та пробіли',
      'any.required': 'Прізвище є обов\'язковим полем'
    }),
  phone: Joi.string()
    .pattern(/^(?:\+?380)?[0-9]{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Будь ласка, введіть коректний український номер телефону (наприклад: +380501234567 або 0501234567)'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Будь ласка, введіть коректну email адресу',
      'any.required': 'Email є обов\'язковим полем'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль є обов\'язковим полем'
    })
});

// Profile update validation schema
export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[А-Яа-яІіЇїЄє'`-\s]+$/)
    .optional()
    .messages({
      'string.min': 'Ім\'я повинно містити щонайменше 2 символи',
      'string.max': 'Ім\'я не може бути довшим за 50 символів',
      'string.pattern.base': 'Ім\'я може містити лише українські літери, апостроф, дефіс та пробіли'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[А-Яа-яІіЇїЄє'`-\s]+$/)
    .optional()
    .messages({
      'string.min': 'Прізвище повинно містити щонайменше 2 символи',
      'string.max': 'Прізвище не може бути довшим за 50 символів',
      'string.pattern.base': 'Прізвище може містити лише українські літери, апостроф, дефіс та пробіли'
    }),
  phone: Joi.string()
    .pattern(/^(?:\+?380)?[0-9]{9}$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Будь ласка, введіть коректний український номер телефону (наприклад: +380501234567 або 0501234567)'
    })
}).min(1).messages({
  'object.min': 'Потрібно оновити хоча б одне поле'
});

// Product validation schemas
export const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  weight: Joi.number().positive().required(),
  categoryId: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
  inStock: Joi.boolean().optional(),
  nutritionInfo: Joi.object().optional()
});

// Category validation schemas
export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().optional()
});

// Order validation schemas
export const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  addressId: Joi.string().required(),
  promoCode: Joi.string().optional(),
  notes: Joi.string().optional()
});

// Review validation schemas
export const reviewSchema = Joi.object({
  productId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).optional()
});

// Address validation schemas
export const addressSchema = Joi.object({
  street: Joi.string()
    .min(5)
    .max(100)
    .required()
    .messages({
      'string.min': 'Назва вулиці повинна містити щонайменше 5 символів',
      'string.max': 'Назва вулиці не може бути довшою за 100 символів',
      'any.required': 'Вулиця є обов\'язковим полем'
    }),
  city: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[А-Яа-яІіЇїЄє'`-\s]+$/)
    .required()
    .messages({
      'string.min': 'Назва міста повинна містити щонайменше 2 символи',
      'string.max': 'Назва міста не може бути довшою за 50 символів',
      'string.pattern.base': 'Назва міста може містити лише українські літери, апостроф, дефіс та пробіли',
      'any.required': 'Місто є обов\'язковим полем'
    }),
  zipCode: Joi.string()
    .pattern(/^\d{5}$/)
    .required()
    .messages({
      'string.pattern.base': 'Поштовий індекс повинен містити 5 цифр',
      'any.required': 'Поштовий індекс є обов\'язковим полем'
    }),
  isDefault: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Поле "Адреса за замовчуванням" повинно бути true або false'
    })
});

// Promo code validation schemas
export const promoCodeSchema = Joi.object({
  code: Joi.string().min(3).max(20).required(),
  discountType: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT').required(),
  discountValue: Joi.number().positive().required(),
  minOrderAmount: Joi.number().positive().optional(),
  maxUses: Joi.number().integer().positive().optional(),
  expiresAt: Joi.date().greater('now').required()
});
