import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    done: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
