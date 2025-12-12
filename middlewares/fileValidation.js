// Define rules for file types and size limits
const fileRules = {
  "files[]": {
    maxSize: 10 * 1024 * 1024, // 10MB
    types: ["image/jpeg", "image/png"],
    sizeMessage: "Each file must not exceed 10MB in size.",
    typeMessage: "All files must be in image format.",
  },
};

// Middleware for file validation
const validateFiles = (req, res, next) => {
  try {
    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Iterate through uploaded files and validate
    for (const fieldName in req.files) {
      const files = req.files[fieldName]; // Array of files for each field
      const rules = fileRules[fieldName]; // Validation rules for the field

      if (!rules) continue; // Skip validation if no rules are defined for this field

      files.forEach((file) => {
        // Check file size
        if (file.size > rules.maxSize) {
          throw new Error(rules.sizeMessage);
        }

        // Check file type
        if (!rules.types.includes(file.mimetype)) {
          throw new Error(rules.typeMessage);
        }
      });
    }

    next(); // Validation passed
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

// Middleware for file validation during updates
const validateFilesForUpdate = (req, res, next) => {
  try {
    // Skip validation if no files are provided
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(); // Proceed without validation
    }

    // Iterate through uploaded files and validate
    for (const fieldName in req.files) {
      const files = req.files[fieldName]; // Array of files for each field
      const rules = fileRules[fieldName]; // Validation rules for the field

      if (!rules) continue; // Skip validation if no rules are defined for this field

      files.forEach((file) => {
        // Check file size
        if (file.size > rules.maxSize) {
          throw new Error(rules.sizeMessage);
        }

        // Check file type
        if (!rules.types.includes(file.mimetype)) {
          throw new Error(rules.typeMessage);
        }
      });
    }

    next(); // Validation passed
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { validateFiles, validateFilesForUpdate };