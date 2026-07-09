//@ts-nocheck
import {Router} from "express";
import signupRouter from "./signupRouter.js"
import loginRouter from "./loginRouter.js"

const router = Router()

router.get("/", (req,res) => {
    if(!req.cookies?.sessionId){
        return res.redirect("/login")
    }
    res.sendFile( "index.html", {
        root: "./public"
    });
})

router.all("/signup", (req,res, next) =>{
    console.log("User is on Sign Up");
    next();
}, signupRouter)

router.all("/login", (req,res,next) => {
    console.log("User is on login")
    next()
}, loginRouter)

export default router;