const { check, validationResult } = require("express-validator");

const userValidationRules = [
  check("name").notEmpty().withMessage("Name is required.").trim().escape(),

  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .normalizeEmail(),

  check("mobileNumber")
    .notEmpty()
    .withMessage("Mobile number is required.")
    .isNumeric()
    .withMessage("Mobile number must contain only numbers.")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits."),

  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[a-z]/)
    .withMessage("Must include a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Must include an uppercase letter.")
    .matches(/\d/)
    .withMessage("Must include a digit.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Must include a special character."),

  check("role").notEmpty().withMessage("Role is required.").trim(),

  check("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female"])
    .withMessage("Gender must be 'male', 'female'"),

  check("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of Birth must be in YYYY-MM-DD format."),

  check("address").optional({ checkFalsy: true }).trim().escape(),

  check("pinCode")
    .optional({ checkFalsy: true })
    .matches(/^\d{6}$/)
    .withMessage("Pin Code must be a valid 6-digit number."),

  check("gstNumber")
    .optional({ checkFalsy: true })
    .matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("GST Number must be a valid 15-character GSTIN."),
];

const clientValidationRules = [
  check("name").notEmpty().withMessage("Name is required.").trim().escape(),

  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .normalizeEmail(),

  check("mobileNumber")
    .notEmpty()
    .withMessage("Mobile number is required.")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits."),

  check("address")
    .notEmpty()
    .withMessage("Address is required")
    .trim()
    .escape(),

  check("pinCode")
    .optional({ checkFalsy: true })
    .matches(/^\d{6}$/)
    .withMessage("Pin Code must be a valid 6-digit number."),

  check("gstNumber")
    .optional({ checkFalsy: true })
    .matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("GST Number must be a valid 15-character GSTIN."),

  check("associatedCompany")
    .notEmpty()
    .withMessage("Associated company is required")
    .trim()
    .escape(),

  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[a-z]/)
    .withMessage("Must include a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Must include an uppercase letter.")
    .matches(/\d/)
    .withMessage("Must include a digit.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Must include a special character."),

  check("companyName").optional({ checkFalsy: true }).trim().escape(),

  check("pointOfContactPersonName")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  check("pointOfContactMobileNumber")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Contact mobile must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact mobile must be 10 digits"),

  check("pointOfContactDesignation")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),
];

const validateProject = [
  check("projectName")
    .notEmpty()
    .withMessage("Project name is required.")
    .isLength({ max: 100 })
    .withMessage("Project name must be less than 100 characters."),
  check("clientType")
    .notEmpty()
    .withMessage("Client type is required.")
    .isIn(["CLIENT", "CLIENT_VENDOR"])
    .withMessage("Client type must be either CLIENT or CLIENT_VENDOR."),
  check("clientId")
    .notEmpty()
    .withMessage("Client ID is required.")
    .isInt()
    .withMessage("Client ID must be an integer."),
];

const validateProjectInfo = [
  check("clientName")
    .notEmpty()
    .withMessage("Client name is required.")
    .isLength({ max: 100 })
    .withMessage("Client name must be less than 100 characters."),
  check("clientEmail")
    .notEmpty()
    .withMessage("Client email is required.")
    .isEmail()
    .withMessage("Client email must be a valid email address."),
  check("university")
    .notEmpty()
    .withMessage("University is required.")
    .isLength({ max: 100 })
    .withMessage("University must be less than 100 characters."),
  check("degreeLevel")
    .notEmpty()
    .withMessage("Degree level is required.")
    .isLength({ max: 50 })
    .withMessage("Degree level must be less than 50 characters."),
  check("researchArea")
    .notEmpty()
    .withMessage("Research area is required.")
    .isLength({ max: 100 })
    .withMessage("Research area must be less than 100 characters."),
  check("projectTitle")
    .notEmpty()
    .withMessage("Project title is required.")
    .isLength({ max: 100 })
    .withMessage("Project title must be less than 100 characters."),
  check("typeOfAssistanceNeeded")
    .notEmpty()
    .withMessage("Type of assistance needed is required.")
    .isArray()
    .withMessage("Type of assistance needed must be an array."),
  check("projectDetails")
    .notEmpty()
    .withMessage("Project details are required.")
    .isLength({ max: 500 })
    .withMessage("Project details must be less than 500 characters."),
  check("expectedOutcome")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Expected outcome must be less than 500 characters."),
  check("deadline")
    .notEmpty()
    .withMessage("Deadline is required.")
    .isISO8601()
    .withMessage("Deadline must be a valid date in ISO 8601 format."),
  check("additionalNote")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Additional note must be less than 500 characters."),

  check("authors")
    .optional()
    .isArray()
    .withMessage("Authors must be a non-empty array"),
  check("authors.*.name")
    .if((value, { req }) => req.body.authors && req.body.authors.length > 0)
    .trim()
    .notEmpty()
    .withMessage("Author name is required"),
  check("authors.*.email")
    .if((value, { req }) => req.body.authors && req.body.authors.length > 0)
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email"),
  check("authors.*.orcidId")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("ORCID ID must be a string"),
  check("authors.*.scholarLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Scholar link must be a valid URL"),
  check("authors.*.collegeAffiliation")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("College affiliation must be a string"),
  check("authors.*.designation")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Designation must be a string"),
];

const validateAddParticipant = [
  check("participants")
    .notEmpty()
    .withMessage("Participants are required.")
    .isArray()
    .withMessage("Participants must be an array."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  clientValidationRules,
  validateProject,
  validateProjectInfo,
  validateAddParticipant,
  validate,
};
