
import express from "express";

import {
    register,
    login,
} from "../controllers/authController.js";

const router = express.Router();


//Register a new user
//POST /api/auth/register
 
router.post("/register", register);


//Login existing user
//POST /api/auth/login

router.post("/login", login);


export default router;

