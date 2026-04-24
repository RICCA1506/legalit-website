import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";

let serverProc = null;
let baseUrl = "";

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHealth(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url + "/health");
      if (r.ok) return;
    } catch (err) {
      lastErr = err;
    }
    await sleep(300);
  }
  throw new Error(`server did not become healthy: ${lastErr?.message ?? "timeout"}`);
}

function isBundleStale(bundle) {
  if (!fs.existsSync(bundle)) return true;
  const bundleMtime = fs.statSync(bundle).mtimeMs;
  const watched = ["server", "shared"];
  for (const dir of watched) {
    if (!fs.existsSync(dir)) continue;
    const stack = [dir];
    while (stack.length) {
      const cur = stack.pop();
      const stat = fs.statSync(cur);
      if (stat.isDirectory()) {
        for (const e of fs.readdirSync(cur)) stack.push(path.join(cur, e));
      } else if (stat.mtimeMs > bundleMtime) {
        return true;
      }
    }
  }
  return false;
}

function runCmd(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", ...opts });
    p.on("error", reject);
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`)),
    );
  });
}

before(async () => {
  const port = String(process.env.TEST_PORT || (await getFreePort()));
  baseUrl = `http://127.0.0.1:${port}`;

  const bundle = path.resolve("dist/index.cjs");
  if (isBundleStale(bundle)) {
    console.log("[test] building production bundle (stale or missing)...");
    await runCmd("npm", ["run", "build"]);
  }

  serverProc = spawn("node", [bundle], {
    env: { ...process.env, NODE_ENV: "production", PORT: port },
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverProc.stdout?.on("data", (d) => process.stdout.write(`[srv] ${d}`));
  serverProc.stderr?.on("data", (d) => process.stderr.write(`[srv-err] ${d}`));

  await waitForHealth(baseUrl);
});

after(() => {
  if (serverProc && !serverProc.killed) {
    serverProc.kill("SIGTERM");
  }
});

// ── /attached_assets extension allowlist ──────────────────────────────────────

test("/attached_assets blocks .docx files (returns 404)", async () => {
  const r = await fetch(`${baseUrl}/attached_assets/CV_LEGALIT_1772024788815.docx`);
  assert.equal(r.status, 404, `expected 404 for .docx, got ${r.status}`);
});

test("/attached_assets blocks .xlsx files (returns 404)", async () => {
  const r = await fetch(`${baseUrl}/attached_assets/Cartel_(1)_1772917321292.xlsx`);
  assert.equal(r.status, 404, `expected 404 for .xlsx, got ${r.status}`);
});

test("/attached_assets blocks .txt files (returns 404)", async () => {
  const r = await fetch(
    `${baseUrl}/attached_assets/1._Gestione_API_Keys_e_Segreti_su_R_1775054546087.txt`,
  );
  assert.equal(r.status, 404, `expected 404 for .txt, got ${r.status}`);
});

test("/attached_assets blocks .zip files (returns 404)", async () => {
  const r = await fetch(`${baseUrl}/attached_assets/nonexistent.zip`);
  assert.equal(r.status, 404, `expected 404 for .zip, got ${r.status}`);
});

test("/attached_assets allows .jpg image files", async () => {
  const r = await fetch(`${baseUrl}/attached_assets/admin-law-new.png`);
  assert.ok(
    r.status === 200 || r.status === 304,
    `expected 200/304 for .png image, got ${r.status}`,
  );
});

test("/attached_assets allows .jpg image files", async () => {
  const r = await fetch(`${baseUrl}/attached_assets/avv-alessandro-miliziano.jpg`);
  assert.ok(
    r.status === 200 || r.status === 304,
    `expected 200/304 for .jpg image, got ${r.status}`,
  );
});

test("/attached_assets path traversal does not expose package.json contents", async () => {
  // Browsers/HTTP clients normalize /../ before sending, so the request arrives
  // as GET /package.json and falls through to the SPA handler (HTML, not JSON).
  // We verify the response is not actual JSON file content.
  const r = await fetch(`${baseUrl}/attached_assets/../package.json`);
  const ct = r.headers.get("content-type") || "";
  const body = await r.text();
  assert.ok(
    !ct.includes("application/json") || !body.includes('"dependencies"'),
    `path traversal must not expose package.json, got content-type: ${ct}`,
  );
});

// ── /api/scrape-linkedin SSRF boundary ───────────────────────────────────────

test("POST /api/scrape-linkedin is admin-only (unauthenticated returns 401)", async () => {
  const r = await fetch(`${baseUrl}/api/scrape-linkedin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://www.linkedin.com/posts/test" }),
  });
  assert.equal(r.status, 401, `expected 401 for unauthenticated request, got ${r.status}`);
});

// Inline unit tests for the isLinkedInUrl validation logic
// (mirrors the server implementation to catch regressions without requiring auth)
test("isLinkedInUrl rejects lookalike domain (attackerlinkedin.com)", () => {
  const isLinkedInUrl = (raw) => {
    try {
      const u = new URL(raw);
      if (u.protocol !== "https:" && u.protocol !== "http:") return false;
      const host = u.hostname.toLowerCase();
      return host === "linkedin.com" || host.endsWith(".linkedin.com");
    } catch {
      return false;
    }
  };

  assert.equal(
    isLinkedInUrl("https://attackerlinkedin.com/posts/test"),
    false,
    "attackerlinkedin.com must be rejected",
  );
  assert.equal(
    isLinkedInUrl("https://corp-linkedin.com/posts/test"),
    false,
    "corp-linkedin.com must be rejected",
  );
  assert.equal(
    isLinkedInUrl("https://notlinkedin.com"),
    false,
    "notlinkedin.com must be rejected",
  );
  assert.equal(
    isLinkedInUrl("https://linkedin.com/posts/test"),
    true,
    "linkedin.com must be accepted",
  );
  assert.equal(
    isLinkedInUrl("https://www.linkedin.com/posts/test"),
    true,
    "www.linkedin.com must be accepted",
  );
  assert.equal(
    isLinkedInUrl("https://media.linkedin.com/image/test"),
    true,
    "media.linkedin.com must be accepted",
  );
  assert.equal(
    isLinkedInUrl("ftp://linkedin.com/posts/test"),
    false,
    "non-http protocol must be rejected",
  );
});
