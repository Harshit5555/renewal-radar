import { useState } from "react";
import AccountDetail from "./pages/AccountDetail.jsx";
import Accounts from "./pages/Accounts.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [view, setView] = useState({ page: "dashboard" });
  const openAccount = (id) => setView({ page: "account", id, from: view.page });

  return (
    <main>
      <header>
        <h1>Renewal Radar</h1>
        <nav>
          <button
            className={view.page === "dashboard" ? "active" : ""}
            onClick={() => setView({ page: "dashboard" })}
          >
            Dashboard
          </button>
          <button
            className={view.page === "accounts" ? "active" : ""}
            onClick={() => setView({ page: "accounts" })}
          >
            Accounts
          </button>
        </nav>
      </header>
      {view.page === "dashboard" && <Dashboard openAccount={openAccount} />}
      {view.page === "accounts" && <Accounts openAccount={openAccount} />}
      {view.page === "account" && (
        <AccountDetail accountId={view.id} goBack={() => setView({ page: view.from ?? "dashboard" })} />
      )}
    </main>
  );
}
