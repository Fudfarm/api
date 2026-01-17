import { parsePhoneNumber } from "awesome-phonenumber";
// import { capitalize } from "lodash";
// import { Name } from "../interface/profile";

/**
 * Format a phone number in international format.
 * @param {string} phone - The phone number to format.
 * @param {string} countryCode - The 2 or 3-letter country code.
 * @return {string} The formatted phone number in international format.
 */
export function cleanPhone(phone: string, countryCode: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, { regionCode: countryCode });
    if (phoneNumber.valid) {
      return phoneNumber.number.e164; // Format as +<country_code><number>
    } else {
      return "invalid";
    }
  } catch {
    return "error";
  }
}

import { Response } from "express";

/**
 * Cleans and validates a phone number. If the phone number is invalid or cannot be parsed,
 * it immediately terminates the response with an appropriate error message and status code (417).
 *
 * This function is intended to be used in Express route handlers where phone number validation
 * must result in immediate response termination without further execution.
 *
 * @param {Response} res - The Express response object used to send the error response.
 * @param {string} rawPhone - The raw phone number input to be validated and formatted.
 * @param {string} countryCode - The country code used to format and validate the phone number.
 * @return {string} - The formatted phone number if valid.
 * @throws {Error} - Throws an error to prevent further execution after sending the response.
 */
export function cleanPhoneOrExit(
  res: Response,
  rawPhone: string,
  countryCode: string,
): string | never {
  const formattedPhone = cleanPhone(rawPhone, countryCode);

  if (formattedPhone === "invalid") {
    res.status(417).json({
      message: "Validation error",
      errors: {
        phone: ["Invalid phone number format"],
      },
    });
    throw new Error("Terminated due to invalid phone"); // Prevent further execution
  } else if (formattedPhone === "error") {
    res.status(417).json({
      message: "Validation error",
      errors: {
        phone: ["Error parsing the phone number"],
      },
    });
    throw new Error("Terminated due to phone parse error"); // Prevent further execution
  }

  return formattedPhone;
}

/**
 * @description Clean and format a name object.
 * @param {Name} name - The name object containing first and last names.
 * @typedef {Object} Name
 * @property {string} first - The first name.
 * @property {string} last - The last name.
 * @return {Name} - The cleaned and formatted name object.
 * @example
 * const name = { first: " john ", last: " doe " };
 * // const cleanedName = cleanName(name);
 * // cleanedName will be { first: "John", last: "Doe" }
 */
// export function cleanName(name: Name): Name {
//   return {
//     first: capitalize(name.first.trim()),
//     last: capitalize(name.last.trim()),
//   };
// }

/**
 * Replaces multiple consecutive spaces in a string with a single space.
 *
 * @param {string} input - The string to clean up.
 * @return {string} A string with multiple spaces replaced by a single space.
 *
 * @example
 * cleanStr("Hello     world!") // "Hello world!"
 */
export function cleanStr(input: string): string {
  if (typeof input !== "string" || input.length === 0) {
    return input; // Return as is if not a string or empty
  }
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Converts a string to lowercase and capitalizes the first letter of each word.
 *
 * @param {string} input - The input string to transform.
 * @return {string} The transformed string with each word capitalized and the rest in lowercase.
 *
 * @example
 * capitalizeWords("hELLo woRLd") // "Hello World"
 */
export function capitalizeWords(input: string): string {
  if (typeof input !== "string" || input.length === 0) {
    return input; // Return as is if not a string or empty
  }
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Checks if a given date is at least a certain age.
 *
 * @param {string|Date} input - The date to check.
 * @param {number} ageLimit - The minimum age in years.
 * @return {boolean} True if the date is at least the specified age, false otherwise.
 *
 * @example
 * isAtLeastAge(new Date("2000-01-01"), 18) // true if current date is after 2018-01-01
 */
export function isAtLeastAge(input: string | Date, ageLimit: number): boolean {
  const date = typeof input === "string" ? new Date(input) : input;

  if (isNaN(date.getTime())) return false; // handle invalid date

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  return (
    age > ageLimit ||
    (age === ageLimit && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
  );
}
