import express from "express";
const router = express.Router();

let {
  allUsers,
  singleUser,
  editUser,
  deleteUser,
} = require("../controllers/userController");
let { isAuthenticated, isAdmin } = require("../middleware/auth");

// user routes
router.get("/users", isAuthenticated, allUsers);
router.get("/users/:id", isAuthenticated, singleUser);
router.put("/users/edit/:id", isAuthenticated, editUser);
router.delete("/users/admin/delete/:id", isAuthenticated, deleteUser);

module.exports = router;
