import { healthLevel } from "./format.js";

export default function HealthBadge({ score }) {
  return <span className={`badge badge-${healthLevel(score)}`}>{score}</span>;
}
