const moment = require("moment-timezone");

/**
 * Converts a UTC date to Asia/Kolkata timezone and formats it
 * @param {Date|string} date - The UTC date or ISO string to convert
 * @param {string} format - Optional moment format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string in Asia/Kolkata timezone
 */
function convertToIST(date, format = "YYYY-MM-DD") {
  if (!date) return null;
  return moment(date).tz("Asia/Kolkata").format(format);
}

module.exports = { convertToIST };
