import { useEffect, useState } from "react";
import { api } from "../api.js";
import HealthBadge from "../HealthBadge.jsx";
import { day, toInputDate, usd } from "../format.js";

export default function AccountDetail({ accountId, goBack }) {
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", dueDate: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.account(accountId).then((a) => {
      setAccount(a);
      setForm({
        owner: a.owner,
        segment: a.segment,
        arr: a.arr,
        healthScore: a.healthScore,
        renewalDate: toInputDate(a.renewalDate),
      });
    });
    api.tasks(accountId).then(setTasks);
  }, [accountId]);

  if (!account || !form) return <p className="muted">Loading...</p>;

  const save = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateAccount(accountId, {
        ...form,
        arr: Number(form.arr),
        healthScore: Number(form.healthScore),
      });
      setAccount(updated);
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const toggleTask = async (task) => {
    const updated = await api.setTaskDone(task._id, !task.done);
    setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate) return;
    const created = await api.addTask(accountId, newTask);
    setTasks([...tasks, created]);
    setNewTask({ title: "", dueDate: "" });
  };

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <>
      <button className="link" onClick={goBack}>
        &larr; Back
      </button>
      <div className="detail-header">
        <h2>{account.name}</h2>
        <HealthBadge score={account.healthScore} />
      </div>
      <p className="muted">
        {account.segment} · {usd(account.arr)} ARR · renews {day(account.renewalDate)} · owned by {account.owner}
      </p>

      <div className="detail-grid">
        <section className="panel">
          <h3>Tasks ({openCount} open)</h3>
          {tasks.length === 0 && <p className="muted">No tasks yet.</p>}
          <ul className="tasks">
            {tasks.map((t) => (
              <li key={t._id} className={t.done ? "done" : ""}>
                <label>
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} />
                  <span>{t.title}</span>
                </label>
                <span className="muted">due {day(t.dueDate)}</span>
              </li>
            ))}
          </ul>
          <form className="row" onSubmit={addTask}>
            <input
              placeholder="New task"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <button type="submit">Add</button>
          </form>
        </section>

        <section className="panel">
          <h3>Edit account</h3>
          <form className="form" onSubmit={save}>
            <label>
              Owner
              <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </label>
            <label>
              Segment
              <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                <option>SMB</option>
                <option>Mid-Market</option>
                <option>Enterprise</option>
              </select>
            </label>
            <label>
              ARR (USD)
              <input type="number" value={form.arr} onChange={(e) => setForm({ ...form, arr: e.target.value })} />
            </label>
            <label>
              Health score (0 to 100)
              <input
                type="number"
                value={form.healthScore}
                onChange={(e) => setForm({ ...form, healthScore: e.target.value })}
              />
            </label>
            <label>
              Renewal date
              <input
                type="date"
                value={form.renewalDate}
                onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
              />
            </label>
            <button type="submit">Save</button>
            {message && <p className="muted">{message}</p>}
          </form>
        </section>
      </div>
    </>
  );
}
