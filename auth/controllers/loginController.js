import { login } from "../services/authService.js"
import { validateLogin } from "../validation/validateLogin.js"

export async function loginController(req,res){
    try{
        console.log("This is the Login request body:",req.body)
        
        validateLogin(req.body)

        const result = await login(req.body)

        console.log("User logged in with: ", result.sessionId)
        res.cookie("sessionId", result.sessionId, {
          httpOnly: true,
          sameSite: "strict",
        });
        

        res.status(201).json({
          message: "User Logged In",
        });
        
        
    }
    catch(error) {
        res.status(400).json({
          error: error.message,
        });
    }
}