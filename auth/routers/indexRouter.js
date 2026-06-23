//@ts-nocheck
import {Router} from "express";
import signupRouter from "./signupRouter.js"

const router = Router()

router.get("/", (req,res) => {
    if(!req.session?.userId){
        return res.redirect("/signup")
    }
    res.sendFile( "index.html", {
        root: "./public"
    });
})

router.all("/signup", (req,res, next) =>{
    console.log("User is on Sign Up");
    next();
}, signupRouter)

export default router;