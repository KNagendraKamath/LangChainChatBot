import { serve } from "bun";
import { file } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    // Serve the index.html by default
    if (path === "/" || path === "") {
      path = "/index.html";
    }

    try {
      // Try to read the file
      const f = file(`${import.meta.dir}${path}`);
      return new Response(f);
    } catch (e) {
      // Return 404 if file not found
      return new Response("Not Found", { status: 404 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);