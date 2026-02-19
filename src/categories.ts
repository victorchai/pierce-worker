export default async (request: Request, url: URL, env: Cloudflare.Env) => {
  if (request.method === "GET") {
    const resp = await env.DB.prepare("SELECT * FROM categories").all();
    return new Response(JSON.stringify(resp.results), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  throw new Error("Unsupported method");
}