import { renderHtml } from "./renderHtml";
import category from "./categories";
import transaction from "./transactions";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;
		console.log(path)

		switch (path) {
			case "/categories":
				return await category(request, url, env);
			case "/transactions":
				return await transaction(request, url, env);
			default:
				return new Response("Not found", { status: 404 });
		}
		// Get query parameters
		const id = url.searchParams.get("id"); // ?id=1
		console.log(id)

		if (request.method === "GET") {
			console.log("This is a GET request");
			// const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
			// const { results } = await stmt.all();
		} else if (request.method === "POST") {
			const body = await request.json();
			console.log("This is a POST request", body);
		} else if (request.method === "PUT") {
			const body = await request.json();
			console.log("This is a PUT request");
		} else if (request.method === "DELETE") {
			console.log("This is a DELETE request");
		} else {
			console.log("Unsupported method", { status: 405 });
		}

		const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
		const { results } = await stmt.all();

		return new Response(renderHtml(JSON.stringify(results, null, 2)), {
			headers: {
				"content-type": "text/html",
			},
		});
	},
} satisfies ExportedHandler<Env>;
