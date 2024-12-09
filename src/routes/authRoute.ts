import express from "express";

const router = express.Router();

let {
  signup,
  signin,
  logout,
  userProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/auth");

router.post("/users/signup", signup);
router.post("/users/signin", signin);
router.post("/users/logout", logout);
router.get("/users/me", isAuthenticated, userProfile);
router.post("/users/forgetpassword", forgotPassword);
router.put("/users/resetpassword/:resettoken", resetPassword);

module.exports = router;
