import { Router } from "express";
import { loginController } from "../controllers/loginController.js"

const router = Router()

router.get("/login", (req,res) => {
    res.sendFile("login.html",{
        root: "./public"
    })
})
router.post("/login", loginController)

export default router