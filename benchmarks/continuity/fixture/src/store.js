// In-memory todo store. koan: swap for a DB-backed impl when DATABASE_URL exists (D-001).
const todos = new Map();
let nextId = 1;

export const add = (text) => { const id = nextId++; todos.set(id, { id, text, done: false }); return todos.get(id); };
export const list = () => [...todos.values()];
export const get = (id) => todos.get(id) ?? null;
export const complete = (id) => { const t = todos.get(id); if (t) t.done = true; return t ?? null; };
