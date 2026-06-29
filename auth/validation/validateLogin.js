// auth/validation/loginValidation.js
export function validateLogin(data) {
  if (typeof data !== "object" || data === null) {
    throw new Error("Body must be an object");
  }

  const { email, password } = data;


  if (typeof email !== "string") {
    throw new Error("Email must be a string");
  }

  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }
}