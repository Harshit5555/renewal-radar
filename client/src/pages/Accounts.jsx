import { useEffect, useState } from "react";
import { api } from "../api.js";
import HealthBadge from "../HealthBadge.jsx";
import { day, usd } from "../format.js";

export default function Accounts({ openAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.accounts().then(setAccounts).catch((e) => setError(e.message));
  }, []);

  return (
    <section className="panel">
      <h2>All accounts ({accounts.length})</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Owner</th>
            <th>Segment</th>
            <th className="num">ARR</th>
            <th>Health</th>
            <th>Renews</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a._id} className="clickable" onClick={() => openAccount(a._id)}>
              <td>{a.name}</td>
              <td>{a.owner}</td>
              <td>{a.segment}</td>
              <td className="num">{usd(a.arr)}</td>
              <td>
                <HealthBadge score={a.healthScore} />
              </td>
              <td>{day(a.renewalDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
