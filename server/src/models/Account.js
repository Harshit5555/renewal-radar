import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true }, // the CSM who owns the account
    segment: { type: String, enum: ["SMB", "Mid-Market", "Enterprise"], default: "SMB" },
    arr: { type: Number, required: true, min: 0 }, // annual recurring revenue, USD
    healthScore: { type: Number, required: true, min: 0, max: 100 },
    renewalDate: { type: Date, required: true },
    source: { type: String, enum: ["manual", "import"], default: "manual" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// Accounts below this score are shown in the dashboard's At Risk list.
export const AT_RISK_THRESHOLD = 40;

export const Account = mongoose.model("Account", accountSchema);
