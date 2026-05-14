# Supabase Edge Functions

Edge Functions act as security middleware. Every request is authenticated
by verifying the FLC JWT (HS256) before any DB write or external query occurs.

| Function         | Path                                | Purpose                       |
| ---------------- | ----------------------------------- | ----------------------------- |
| `log-activity`   | `POST /functions/v1/log-activity`   | Insert activity_logs row      |
| `upsert-profile` | `POST /functions/v1/upsert-profile` | Upsert profiles row           |
| `neo4j-query`    | `POST /functions/v1/neo4j-query`    | Proxy Cypher queries to Neo4j |

---

## First-time setup

### 1. Install Supabase CLI (if not already)

```bash
npm install -g supabase
```

### 2. Link the project

```bash
npx supabase login
npx supabase link --project-ref hdoxsgsatvvbraxbwvna
```

### 3. Set secrets

```bash
npx supabase secrets set \
  FLC_JWT_SECRET="<the HS256 secret from the FLC auth Lambda>" \
  SUPABASE_SERVICE_ROLE_KEY="<from Supabase dashboard → Settings → API → service_role>" \
  NEO4J_HTTP_URL="http://your-neo4j-server:7474" \
  NEO4J_USER="neo4j" \
  NEO4J_PASSWORD="<your-neo4j-password>"
# Optional — only if your database name is not "neo4j":
# NEO4J_DATABASE="neo4j"
```

> `SUPABASE_URL` is auto-injected by the Supabase runtime — do not set it manually.

### 4. Deploy all functions

```bash
npx supabase functions deploy log-activity --project-ref hdoxsgsatvvbraxbwvna --no-verify-jwt
npx supabase functions deploy upsert-profile --project-ref hdoxsgsatvvbraxbwvna --no-verify-jwt
npx supabase functions deploy neo4j-query --project-ref hdoxsgsatvvbraxbwvna --no-verify-jwt
```

---

## Re-deploying after changes

```bash
npx supabase functions deploy log-activity --project-ref hdoxsgsatvvbraxbwvna --no-verify-jwt
npx supabase functions deploy upsert-profile --project-ref hdoxsgsatvvbraxbwvna --no-verify-jwt
npx supabase functions deploy neo4j-query --project-ref hdoxsgsatvvbraxbwvna --no-verify-jwt
```

> `--no-verify-jwt` is required because these functions receive **FLC JWTs**, not Supabase JWTs.
> Without it, Supabase's edge runtime rejects with `UNAUTHORIZED_LEGACY_JWT` before the function
> code even runs. The functions themselves handle JWT verification via `jose.jwtVerify`.

---

## Local development / testing

```bash
npx supabase start          # start local Supabase stack
npx supabase functions serve  # serve all functions locally at http://localhost:54321/functions/v1/
```

To point the React app at the local functions during dev, set in `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
```

---

## Security model

1. React app sends the raw FLC `accessToken` (from `localStorage`) in `Authorization: Bearer`.
2. Edge Function verifies the JWT signature using `FLC_JWT_SECRET` (HS256).
3. `submitted_by_id` / `profile.id` is **always overwritten** from the verified JWT payload —
   the client-supplied value is ignored.
4. All DB writes use the `SUPABASE_SERVICE_ROLE_KEY`, which is never exposed to the browser.

---

## Request shapes

### POST /functions/v1/log-activity

```json
{
  "row": {
    "activity_id": "p1",
    "activity_name": "Bacenta Prayer Meeting",
    "category": "prayer",
    "level": "bacenta",
    "freq": "weekly",
    "iso_week": "2026-W20",
    "type": "activity",
    "fields": { ... },
    "bacenta_id": "...",
    "governorship_id": "...",
    "submitted_by_name": "David Dag Vanderpuije"
  }
}
```

`submitted_by_id` is always sourced from the verified JWT — do not include it in `row`.

### POST /functions/v1/upsert-profile

```json
{
  "profile": {
    "email": "...",
    "first_name": "...",
    "last_name": "...",
    "level": "overseer",
    "roles": ["leaderOversight"],
    "stream_id": "2dd77486",
    "stream_name": "Colossians"
  }
}
```

`profile.id` is always overwritten from the verified JWT.

### POST /functions/v1/neo4j-query

```json
{
  "query": "MATCH (m:Member {email: $email}) RETURN m",
  "parameters": { "email": "user@example.com" }
}
```

Response (success):

```json
{
  "data": [
    {
      "columns": ["m"],
      "data": [{ "row": [{ "id": "...", "firstName": "..." }], "meta": [{}] }]
    }
  ]
}
```

`parameters` is optional (defaults to `{}`).
The query is executed as-is — the caller is responsible for supplying safe, parameterised Cypher.
