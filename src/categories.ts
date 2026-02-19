export default async (request: Request, url: URL, env: Cloudflare.Env) => {
  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM types").all();
    const types = results.reduce((acc, type) => {
      acc[type.id as number] = type.name;
      return acc;
    }, {} as Record<number, string>)

    const resp = await env.DB.prepare("SELECT * FROM categories").all();
    return new Response(JSON.stringify(resp.results.map((v) => ({
      ...v,
      pf_type: types[v.type as number]
    }))), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  throw new Error("Unsupported method");
}