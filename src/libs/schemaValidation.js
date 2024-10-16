const Joi = require('joi');

// Define the user schema
const userSchema = Joi.object({
    name: Joi.string().min(1).max(50).required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 1 character long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) // At least one letter, one number, and one special character
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one letter, one number, and one special character',
            'any.required': 'Password is required',
        }),
    age: Joi.number().integer().min(13).max(120).required().messages({ // Assuming a minimum age of 13 for chat apps
        'number.base': 'Age must be a number',
        'number.min': 'Age must be at least 13',
        'number.max': 'Age must not exceed 120',
        'any.required': 'Age is required',
    }),
    gender: Joi.string().valid('man', 'woman', 'other').required().messages({
        'any.only': 'Gender must be either male, female, or other',
        'any.required': 'Gender is required',
    }),
    role: Joi.string().valid('admin', 'user').required().messages({
        'any.only': 'Role must be either "admin" or "user"',
        'any.required': 'Role is required',
    }),

    // username: Joi.string().alphanum().min(3).max(30).optional().messages({
    //     'string.base': 'Username must be a string',
    //     'string.empty': 'Username cannot be empty',
    //     'string.alphanum': 'Username must only contain letters and numbers',
    //     'string.min': 'Username must be at least 3 characters long',
    //     'string.max': 'Username must not exceed 30 characters',
    // }),
    // profilePicture: Joi.string().uri().optional().messages({
    //     'string.uri': 'Profile picture must be a valid URL',
    // }),
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(1).max(50).required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 1 character long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
    }),
    age: Joi.number().integer().min(13).max(120).required().messages({ // Assuming a minimum age of 13 for chat apps
        'number.base': 'Age must be a number',
        'number.min': 'Age must be at least 13',
        'number.max': 'Age must not exceed 120',
        'any.required': 'Age is required',
    }),
    gender: Joi.string().valid('man', 'woman', 'other').required().messages({
        'any.only': 'Gender must be either male, female, or other',
        'any.required': 'Gender is required',
    }),
    role: Joi.string().valid('admin', 'user').required().messages({
        'any.only': 'Role must be either "admin" or "user"',
        'any.required': 'Role is required',
    }),
});

const signInSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
    })
});

const emailSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email',
        'any.required': 'Email is required',
    }),
});

const passwordSchema = Joi.object({
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) // At least one letter, one number, and one special character
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one letter, one number, and one special character',
            'any.required': 'Password is required',
        }),
});

const updateProfileSchema = Joi.object({
    bio: Joi.string().max(160).messages({
        'string.base': 'Bio must be a string',
        'string.max': 'Bio cannot exceed 160 characters', // 160 is a common standard for short bios (e.g., Twitter)
    }),
    contactNumber: Joi.string().custom((value, helpers) => {
        // Check if the contact number starts with a '+'
        if (!value.startsWith('+')) {
            return helpers.error('any.invalid'); // Not valid if it doesn't start with '+'
        }

        // Validate the overall length of the contact number
        if (value.length < 10 || value.length > 15) {
            return helpers.error('string.length'); // Error for length
        }

        // Validate the regex pattern
        const pattern = /^\+\d{1,3}\d{7,14}$/;
        if (!pattern.test(value)) {
            return helpers.error('string.pattern.base'); // Error for invalid format
        }

        return value; // Return the value if all checks pass
    }).messages({
        'any.invalid': 'Please enter a contact number starting with a valid country code (e.g., +1 for the USA).',
        'string.length': 'The contact number must be between 10 and 15 digits long, including the country code.',
        'string.pattern.base': 'The contact number should follow the format +[country_code][number] (e.g., +441234567890).'
    }),
    hashTags: Joi.array().items(
        Joi.string().pattern(/^#[a-zA-Z0-9_]+$/).max(30).messages({
            'string.pattern.base': 'Each hashtag must start with a # and contain only letters, numbers, and underscores',
            'string.max': 'Hashtag cannot exceed 30 characters',
        })
    ).max(10).messages({
        'array.base': 'Hashtags must be an array of strings',
        'array.max': 'You cannot provide more than 10 hashtags',
    }),
});


module.exports = { userSchema, updateUserSchema, signInSchema, emailSchema, passwordSchema, updateProfileSchema };
