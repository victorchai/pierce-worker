export default async (request: Request, url: URL, env: Cloudflare.Env) => {
  if (request.method === "GET") {
    const resp = await getTransactions(env);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  throw new Error("Unsupported method");
}

async function getTransactions(env: Cloudflare.Env) {
  const resp = await env.DB.prepare("SELECT * FROM transactions").all();
  return resp.results;
}

async function createTransaction(env: Cloudflare.Env, data: any) {
  const stmt = env.DB.prepare(
    "INSERT INTO transactions (expense_type_id, amount_cents, created_at) VALUES (?, ?, ?)"
  );
  // INSERT INTO "main"."transactions" ("id", "type", "category", "date", "createdBy", "tag1", "tag2", "tag3", "amount", "description", "name") VALUES('as', 1, 1, 'a', '1', '1', '1', '1', 1, '1', '1') RETURNING rowid, *
}