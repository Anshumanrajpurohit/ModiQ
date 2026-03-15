import { createClient } from "@supabase/supabase-js"
import { Pool } from "pg"

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }
  return url
}

const getAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
  }
  return key
}

const buildNeonConnectionString = () => {
  const raw =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL ??
    process.env.SUPABASE_DB_URL

  if (!raw) {
    throw new Error("DATABASE_URL (or POSTGRES_URL/NEON_DATABASE_URL) is not set")
  }

  // Normalize SSL mode for Neon + pg.
  if (/sslmode=/i.test(raw)) {
    return raw.replace(/sslmode=(prefer|require|verify-ca)\b/i, "sslmode=verify-full")
  }

  return `${raw}${raw.includes("?") ? "&" : "?"}sslmode=verify-full`
}

declare global {
  var __neonPool: Pool | undefined
}

const getNeonPool = () => {
  if (!globalThis.__neonPool) {
    globalThis.__neonPool = new Pool({
      connectionString: buildNeonConnectionString(),
    })
  }

  return globalThis.__neonPool
}

const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

const quoteIdentifier = (identifier: string) => {
  if (!IDENTIFIER_RE.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`)
  }
  return `"${identifier}"`
}

const sqlPlaceholder = (_value: unknown, index: number) => `$${index}`

type Filter = { column: string; value: unknown }
type Sort = { column: string; ascending: boolean }

type Operation = "select" | "insert" | "update"
type RowMode = "many" | "single" | "maybeSingle"
type QueryResponse = {
  data: unknown
  error: { message: string } | null
}

class NeonQueryBuilder implements PromiseLike<QueryResponse> {
  private operation: Operation = "select"
  private rowMode: RowMode = "many"
  private payload: Record<string, unknown> | null = null
  private filters: Filter[] = []
  private sorts: Sort[] = []
  private rowLimit: number | null = null

  constructor(
    private readonly pool: Pool,
    private readonly table: string,
  ) {
    quoteIdentifier(table)
  }

  select(columns: string) {
    void columns
    return this
  }

  insert(payload: Record<string, unknown>) {
    this.operation = "insert"
    this.payload = payload
    return this
  }

  update(payload: Record<string, unknown>) {
    this.operation = "update"
    this.payload = payload
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sorts.push({ column, ascending: options?.ascending !== false })
    return this
  }

  limit(count: number) {
    this.rowLimit = count
    return this
  }

  single() {
    this.rowMode = "single"
    return this
  }

  maybeSingle() {
    this.rowMode = "maybeSingle"
    return this
  }

  then<TResult1 = QueryResponse, TResult2 = never>(
    onfulfilled?: ((value: QueryResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private buildWhere(startIndex: number) {
    if (!this.filters.length) {
      return { clause: "", params: [] as unknown[] }
    }

    const parts: string[] = []
    const params: unknown[] = []

    this.filters.forEach((filter, index) => {
      parts.push(`${quoteIdentifier(filter.column)} = $${startIndex + index}`)
      params.push(filter.value)
    })

    return { clause: ` WHERE ${parts.join(" AND ")}`, params }
  }

  private async execute() {
    try {
      const { text, values } = this.buildQuery()
      const result = await this.pool.query(text, values)
      const rows = result.rows

      if (this.rowMode === "single") {
        if (rows.length !== 1) {
          return { data: null, error: { message: `Expected 1 row, got ${rows.length}` } }
        }
        return { data: rows[0], error: null }
      }

      if (this.rowMode === "maybeSingle") {
        if (rows.length > 1) {
          return { data: null, error: { message: `Expected 0 or 1 row, got ${rows.length}` } }
        }
        return { data: rows[0] ?? null, error: null }
      }

      return { data: rows, error: null }
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : String(error) },
      }
    }
  }

  private buildQuery() {
    if (this.operation === "select") {
      let text = `SELECT * FROM ${quoteIdentifier(this.table)}`
      const values: unknown[] = []

      const where = this.buildWhere(1)
      text += where.clause
      values.push(...where.params)

      if (this.sorts.length) {
        const orderBy = this.sorts
          .map((sort) => `${quoteIdentifier(sort.column)} ${sort.ascending ? "ASC" : "DESC"}`)
          .join(", ")
        text += ` ORDER BY ${orderBy}`
      }

      if (typeof this.rowLimit === "number") {
        text += ` LIMIT $${values.length + 1}`
        values.push(this.rowLimit)
      }

      return { text, values }
    }

    if (!this.payload || Object.keys(this.payload).length === 0) {
      throw new Error(`${this.operation.toUpperCase()} payload is required`)
    }

    const keys = Object.keys(this.payload)
    const table = quoteIdentifier(this.table)

    if (this.operation === "insert") {
      const columns = keys.map((key) => quoteIdentifier(key)).join(", ")
      const placeholders = keys
        .map((key, index) => sqlPlaceholder(this.payload?.[key], index + 1))
        .join(", ")
      const values = keys.map((key) => this.payload?.[key])
      const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`
      return { text, values }
    }

    const setClause = keys
      .map((key, index) => `${quoteIdentifier(key)} = ${sqlPlaceholder(this.payload?.[key], index + 1)}`)
      .join(", ")
    const values = keys.map((key) => this.payload?.[key])
    const where = this.buildWhere(values.length + 1)
    const text = `UPDATE ${table} SET ${setClause}${where.clause} RETURNING *`
    values.push(...where.params)
    return { text, values }
  }
}

class NeonDatabaseClient {
  from(table: string) {
    return new NeonQueryBuilder(getNeonPool(), table)
  }
}

export const createBrowserDatabaseClient = () => {
  return createClient(getSupabaseUrl(), getAnonKey())
}

export const createServerDatabaseClient = () => {
  return new NeonDatabaseClient()
}

export const createDatabaseClient = createServerDatabaseClient

export const queryServerDatabase = async <TRow = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) => {
  const result = await getNeonPool().query(text, values)
  return result.rows as TRow[]
}

// Backward-compatible exports while callsites migrate to neutral names.
export const createSupabaseBrowserClient = createBrowserDatabaseClient
export const createSupabaseServiceRoleClient = createServerDatabaseClient
