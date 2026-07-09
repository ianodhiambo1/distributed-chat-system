//@ts-nocheck
import {Router} from "express";
import { signupController } from "../controllers/signupController.js"

const router = Router();

router.get("/signup", (req,res) => {
    res.sendFile( "signup.html", {
        root: "./public"
    });
})
router.post("/signup", signupController)

export default router


