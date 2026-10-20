import { Router } from "express";
import { Account, AT_RISK_THRESHOLD } from "../models/Account.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res) => {
  const accounts = await Account.countDocuments({});
  const [arr] = await Account.aggregate([{ $group: { _id: null, totalArr: { $sum: "$arr" } } }]);
  const atRisk = await Account.countDocuments({ healthScore: { $lt: AT_RISK_THRESHOLD } });

  res.json({ accounts, totalArr: arr?.totalArr ?? 0, atRisk });
});

dashboardRouter.get("/at-risk", async (_req, res) => {
  const accounts = await Account.find({ healthScore: { $lt: AT_RISK_THRESHOLD } }).sort({ healthScore: 1 });
  res.json(accounts);
});

dashboardRouter.get("/owners", async (_req, res) => {
  const owners = await Account.distinct("owner");
  res.json(owners.sort());
});
