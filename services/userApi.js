const API_BASE = process.env.NEXT_PUBLIC_USERSERVICE_API || "http://mock-backend:4000";

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
