export default async (request: Request, url: URL, env: Cloudflare.Env) => {
  if (request.method === "GET") {
    const resp = await getTransactions(env);
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
  }

  throw new Error("Unsupported method");
}

async function getTransactions(env: Cloudflare.Env) {
  const resp = await env.DB.prepare("SELECT * FROM transactions").all();
  return resp.results;
}

async function createTransaction(env: Cloudflare.Env, data: any) {
  const id = new Date().toISOString();
  const stmt = env.DB.prepare(
    `INSERT INTO transactions (id, type, category, date, createdBy, tag1, tag2, tag3, amount, description, name) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const resp = await stmt.bind(id, data['type'], data['category'], data['date'], '-', data['tag1'], data['tag2'], data['tag3'], data['amount'], data['description'], data['name']).run();
  console.log(resp.results);
  return resp.results;
}