//@ts-nocheck
import { validateSignup } from "../validation/validateSignup.js";
import { signup } from "../services/authService.js";

export async function signupController(req, res) {
    try {
        console.log("This is the request body:  ",req.body)
        
        validateSignup(req.body);

        const result = await signup(req.body);

        console.log("These is the data after validation",result)

        res.cookie("sessionId", result.sessionId, {
            httpOnly : true,
            sameSite: "strict",
        });

        res.status(201).json({ 
            message: "User created",
        });
    }     
    catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
}


