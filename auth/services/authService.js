//@ts-nocheck

import crypto from "crypto";
import argon2 from "argon2"

import {
  findUserByEmail,
  createUser,
} from "../repositories/userRepository.js";

import { redis } from "../../db/redis.js";

export async function signup(data) {
    console.log("This is the data in sign up fucntion ", data)
    const existingUser = await findUserByEmail(data.email);
    console.log("user found in database: ", existingUser)
    if(existingUser){
        throw new Error("Email already exists");
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await createUser({
        email: data.email,
        passwordHash: passwordHash,
    });

    console.log("Data has been sent to user repository file")

    const sessionId = crypto.randomUUID();

    await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
            userId: user.id,
        })
    )

        return {
            userId: user.id,
            sessionId,
        }
}