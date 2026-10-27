// Mocked Drizzle database for fast route tests (no Postgres needed).
//
// Drizzle queries are chainable and awaitable, e.g.
//   await db.select().from(tasks).where(...)
//   await db.update(tasks).set({...}).where(...).returning()
// createQueryBuilder() returns an object where every chain method returns the
// same builder, and awaiting it resolves to the rows you configured.
//
// Usage in a test file:
//   const { mockDb } = await vi.hoisted(async () => ({
//     mockDb: (await import("../setup/db-mock")).mockDb,
//   }));
//   vi.mock("../../server/src/db/index.js", () => ({ db: mockDb }));
//
//   mockDb.select.mockReturnValueOnce(queryResult([{ id: 1 }]));
import { vi } from "vitest";

const CHAIN_METHODS = [
  "from",
  "where",
  "limit",
  "orderBy",
  "innerJoin",
  "values",
  "set",
  "returning",
] as const;

export type QueryBuilder = Record<(typeof CHAIN_METHODS)[number], ReturnType<typeof vi.fn>> & {
  then: PromiseLike<unknown>["then"];
  resolveWith: (rows: unknown) => QueryBuilder;
};

// Builder that resolves to `rows` when awaited.
export const queryResult = (rows: unknown = []): QueryBuilder => createQueryBuilder(rows);

const createQueryBuilder = (rows: unknown = []): QueryBuilder => {
  let result = rows;
  const builder = {} as QueryBuilder;

  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn(() => builder);
  }

  builder.resolveWith = (value: unknown) => {
    result = value;
    return builder;
  };

  builder.then = ((onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected)) as QueryBuilder["then"];

  return builder;
};

const createMockDb = () => ({
  select: vi.fn(() => createQueryBuilder()),
  insert: vi.fn(() => createQueryBuilder()),
  update: vi.fn(() => createQueryBuilder()),
  delete: vi.fn(() => createQueryBuilder()),
});

export const mockDb = createMockDb();

// Call in beforeEach to clear call history and restore default behaviour.
export const resetMockDb = () => {
  for (const fn of Object.values(mockDb)) {
    fn.mockReset();
    fn.mockImplementation(() => createQueryBuilder());
  }
};
