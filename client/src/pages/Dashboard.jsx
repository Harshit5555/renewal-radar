import { useEffect, useState } from "react";
import { api } from "../api.js";
import HealthBadge from "../HealthBadge.jsx";
import { day, usd } from "../format.js";

export default function Dashboard({ openAccount }) {
  const [summary, setSummary] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.summary(), api.atRisk()])
      .then(([s, r]) => {
        setSummary(s);
        setAtRisk(r);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p className="muted">Loading...</p>;

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span className="stat-label">Accounts</span>
          <span className="stat-value">{summary.accounts}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total ARR</span>
          <span className="stat-value">{usd(summary.totalArr)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">At risk (health under 40)</span>
          <span className="stat-value">{summary.atRisk}</span>
        </div>
      </div>

      <section className="panel">
        <h2>At risk</h2>
        {atRisk.length === 0 ? (
          <p className="muted">No accounts at risk.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Owner</th>
                <th className="num">ARR</th>
                <th>Health</th>
                <th>Renews</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((a) => (
                <tr key={a._id} className="clickable" onClick={() => openAccount(a._id)}>
                  <td>{a.name}</td>
                  <td>{a.owner}</td>
                  <td className="num">{usd(a.arr)}</td>
                  <td>
                    <HealthBadge score={a.healthScore} />
                  </td>
                  <td>{day(a.renewalDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
