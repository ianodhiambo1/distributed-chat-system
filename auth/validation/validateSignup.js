// auth/validation/signupValidation.js
export function validateSignup(data) {
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

  if (email.length < 3) {
    throw new Error("Email too short");
  }

  if (password.length < 8) {
    throw new Error("Password too short");
  }
}