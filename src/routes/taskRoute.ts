import express from "express";
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
let {
  createTask,
  singleTask,
  myTask,
  updateTask,
  deleteTask,
  showTasks,
} = require("../controllers/taskController");

// task routes
router.post("/tasks/create", isAuthenticated, isAdmin, createTask);
router.get("/tasks/:task_id", singleTask);
router.get("/get-all-tasks", showTasks);
router.get("/mytasks", isAuthenticated, myTask);
router.put("/task/edit/:task_id", isAuthenticated, updateTask);
router.delete("/task/delete/:task_id", isAuthenticated, isAdmin, deleteTask);

module.exports = router;
