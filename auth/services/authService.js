//@ts-nocheck

import crypto from "crypto";
import argon2 from "argon2";

import {
    findUserByEmail,
    createUser,
    loginUser,
} from "../repositories/userRepository.js";

import { redis } from "../../db/redis.js";

export async function signup(data) {
    console.log("This is the data in sign up fucntion ", data);
    const existingUser = await findUserByEmail(data.email);
    console.log("user found in database: ", existingUser);
    if (existingUser) {
        throw new Error("Email already exists");
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await createUser({
        email: data.email,
        passwordHash: passwordHash,
    });

    console.log("Data has been sent to user repository file");

    const sessionId = crypto.randomUUID();

    await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
            userId: user.id,
        }),
    );

    return {
        userId: user.id,
        sessionId,
    };
}

export async function login(data) {
    console.log("Data is in the login function: ", data);
    const existingUser = await loginUser(data.email);
    console.log("Logging in...")
    if (!existingUser) {
        throw new Error("Wrong Password or email");
    }
    try {
        if (await argon2.verify(existingUser.password_hash, data.password)) {
          // password match
          console.log("Password matched");
        } else {
          // password did not match
          return false;
        }
    } catch (err) {
        // internal failure
        console.log(err);
    }

    const sessionId = crypto.randomUUID()

    await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
            user: existingUser.id
        })
    );
    return {
        userId : existingUser.id,
        sessionId : sessionId
    }
}
