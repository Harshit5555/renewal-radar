import { Router } from "express";
import { Account } from "../models/Account.js";
import { Task } from "../models/Task.js";
import { importAccounts } from "../services/importService.js";

export const accountsRouter = Router();

accountsRouter.get("/", async (req, res) => {
  const filter = {};
  if (req.query.owner) filter.owner = req.query.owner;
  const accounts = await Account.find(filter).sort({ name: 1 });
  res.json(accounts);
});

accountsRouter.post("/", async (req, res) => {
  const account = await Account.create(req.body);
  res.status(201).json(account);
});

accountsRouter.post("/import", async (req, res) => {
  const result = await importAccounts(req.body?.rows);
  res.status(201).json(result);
});

accountsRouter.get("/:id", async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) return res.status(404).json({ error: "Account not found" });
  res.json(account);
});

accountsRouter.put("/:id", async (req, res) => {
  const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!account) return res.status(404).json({ error: "Account not found" });
  res.json(account);
});

accountsRouter.get("/:id/tasks", async (req, res) => {
  const tasks = await Task.find({ accountId: req.params.id }).sort({ done: 1, dueDate: 1 });
  res.json(tasks);
});

accountsRouter.post("/:id/tasks", async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) return res.status(404).json({ error: "Account not found" });
  const task = await Task.create({ ...req.body, accountId: account._id });
  res.status(201).json(task);
});
