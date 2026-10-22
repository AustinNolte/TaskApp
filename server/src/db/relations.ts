import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";

export const relations = defineRelations(schema, (r) => ({
  tasks: {
    owner: r.one.users({
      from: r.tasks.userId,
      to: r.users.id,
    }),
  },
  users: {
    tasks: r.many.tasks(),
    sessions: r.many.sessions(),
  },
  sessions: {
    user: r.one.users({ from: r.sessions.userId, to: r.users.id }),
  },
}));
