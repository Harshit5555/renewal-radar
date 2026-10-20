async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  summary: () => request("/dashboard/summary"),
  atRisk: () => request("/dashboard/at-risk"),
  owners: () => request("/dashboard/owners"),
  accounts: (owner) => request(`/accounts${owner ? `?owner=${encodeURIComponent(owner)}` : ""}`),
  account: (id) => request(`/accounts/${id}`),
  updateAccount: (id, data) => request(`/accounts/${id}`, send("PUT", data)),
  tasks: (accountId) => request(`/accounts/${accountId}/tasks`),
  addTask: (accountId, data) => request(`/accounts/${accountId}/tasks`, send("POST", data)),
  setTaskDone: (taskId, done) => request(`/tasks/${taskId}`, send("PATCH", { done })),
};
