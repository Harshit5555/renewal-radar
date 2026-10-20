import { Router } from "express";
import { Task } from "../models/Task.js";

export const tasksRouter = Router();

// Mark a task done or not done.
tasksRouter.patch("/:id", async (req, res) => {
  const { done } = req.body ?? {};
  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "done must be true or false" });
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { done, completedAt: done ? new Date() : null },
    { runValidators: true },
  );
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});
