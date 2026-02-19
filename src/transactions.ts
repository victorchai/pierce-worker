export default async (request: Request, url: URL, env: Cloudflare.Env) => {
  if (request.method === "GET") {
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    const resp = await getTransactions(env, start, end);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })
  } else if (request.method === "POST") {
    const resp = await createTransaction(env, await request.json());
    return new Response(JSON.stringify(resp), {
      status: 201,
      headers: {
        "content-type": "application/json",
      },
    });
  } else if (request.method === "PUT") {
    const resp = await updateTransaction(env, await request.json());
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  } else if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing id parameter", { status: 400 });
    }

    await deleteTransaction(env, id);
    return new Response(null, { status: 204 });
  }

  throw new Error("Unsupported method");
}

async function getTransactions(env: Cloudflare.Env, start?: string | null, end?: string | null) {
  if (!start) {
    const resp = await env.DB.prepare("SELECT * FROM transactions").all();
    return resp.results;
  } else if (!end) {
    const resp = await env.DB.prepare("SELECT * FROM transactions WHERE date >= ?").bind(start).all();
    return resp.results;
  } else {
    const resp = await env.DB.prepare("SELECT * FROM transactions WHERE date >= ? AND date <= ?").bind(start, end).all();
    return resp.results;
  }
}

async function createTransaction(env: Cloudflare.Env, data: any) {
  const now = new Date().toISOString();
  const stmt = env.DB.prepare(`
    INSERT INTO transactions
    (id, type, category, date, createdBy, tag1, tag2, tag3, amount, description, name, createdAt)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const resp = await stmt.bind(
    `${now}_${Math.random().toString(36).substring(2, 8)}`,
    data["type"],
    data["category"],
    data["date"],
    "-",
    data["tag1"] ?? null,
    data["tag2"] ?? null,
    data["tag3"] ?? null,
    data["amount"],
    data["description"] ?? "",
    data["name"],
    now
  ).run();
  return resp.results;
}

async function updateTransaction(env: Cloudflare.Env, data: any) {
  const stmt = env.DB.prepare(`
    UPDATE transactions
    SET type = ?, category = ?, date = ?, createdBy = ?, tag1 = ?, tag2 = ?, tag3 = ?, amount = ?, description = ?, name = ?
    WHERE id = ?
  `);
  const resp = await stmt.bind(
    data["type"],
    data["category"],
    data["date"],
    "-",
    data["tag1"] ?? null,
    data["tag2"] ?? null,
    data["tag3"] ?? null,
    data["amount"],
    data["description"] ?? "",
    data["name"],
    data["id"]
  ).run();
  return resp.results;
}

async function deleteTransaction(env: Cloudflare.Env, id: string) {
  const stmt = env.DB.prepare(`
    DELETE FROM transactions
    WHERE id = ?
  `);
  const resp = await stmt.bind(id).run();
  return resp.results;
}