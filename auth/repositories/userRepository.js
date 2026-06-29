import { client } from "../../db/postgres.js";

export async function findUserByEmail(email) {
  const result = await client.query(
    `
        SELECT * FROM users
        WHERE email = $1
        `,
    [email],
  );
  console.log("Data is at the findUserByEmail query phase : ", email);
  return result.rows[0];
}

export async function createUser(user) {
  const result = await client.query(
    `
        INSERT INTO users
        (email, password_hash)
        VALUES ($1, $2)
        RETURNING id
        `,
    [user.email, user.passwordHash],
  );
  console.log("Data is at the createUser query phase : ", user);
  return result.rows[0];
}

export async function loginUser(email) {
  console.log("Log in query...");
  try {
    const result = await client.query(
      `
            SELECT * FROM users
            WHERE email = $1
            `,
      [email],
    );

    const user = result.rows[0];
    console.log("Retrieved from the database:", user);

    return user;
  } catch (err) {
    console.error(err);
  }
}