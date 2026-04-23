import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";

let serverProc = null;
let baseUrl = "";
let validArticleId = null;
let validArticleSlug = null;

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

  const r = await fetch(`${baseUrl}/api/news`);
  assert.equal(r.status, 200, "GET /api/news failed during setup");
  const arr = await r.json();
  assert.ok(Array.isArray(arr) && arr.length > 0, "expected at least one news article");
  const first = arr.find((a) => a && a.slug) || arr[0];
  validArticleId = first.id;
  validArticleSlug = first.slug;
});

after(() => {
  if (serverProc && !serverProc.killed) {
    serverProc.kill("SIGTERM");
  }
});

test("GET /news?article=<valido> is SEO-safe (301 to slug URL, no meta-refresh anywhere)", async () => {
  const target = `${baseUrl}/news?article=${validArticleId}`;

  // The legacy /news?article=<id> form must 301-redirect to the semantic
  // slug URL /news/<slug>. (The original task description allowed a 200
  // with a self-canonical instead, but the project intentionally moved
  // to slug URLs — see task #6. We assert the slug-redirect contract
  // explicitly so any regression toward 200/200+meta-refresh is caught.)
  const direct = await fetch(target, { redirect: "manual" });
  assert.equal(
    direct.status,
    301,
    `expected 301 for /news?article=<valid>, got ${direct.status}`,
  );
  assert.equal(
    direct.headers.get("location"),
    `/news/${validArticleSlug}`,
    "redirect target must be /news/<slug>",
  );

  // The redirect response itself must not carry a meta-refresh in its body.
  const directBody = await direct.text();
  assert.doesNotMatch(
    directBody,
    /http-equiv\s*=\s*["']?refresh/i,
    "redirect response body must not contain meta-refresh",
  );

  // After following redirects, the final SPA page must:
  // - serve 200
  // - carry a canonical link to https://legalit.it/news/<slug>
  // - never contain a <meta http-equiv="refresh"> tag (the original bug).
  const followed = await fetch(target);
  assert.equal(
    followed.status,
    200,
    `expected 200 after following redirects, got ${followed.status}`,
  );
  const finalHtml = await followed.text();
  assert.doesNotMatch(
    finalHtml,
    /http-equiv\s*=\s*["']?refresh/i,
    "final HTML must not contain meta-refresh",
  );
  assert.match(
    finalHtml,
    new RegExp(
      `<link[^>]+rel=["']canonical["'][^>]+href=["']https://legalit\\.it/news/${validArticleSlug}["']`,
      "i",
    ),
    "canonical link must point to https://legalit.it/news/<slug>",
  );
});

test("GET /news?article=<inesistente> returns 404", async () => {
  const r = await fetch(`${baseUrl}/news?article=999999`, { redirect: "manual" });
  assert.equal(r.status, 404, `expected 404, got ${r.status}`);
});

test("GET /attivita/<slug-inesistente> returns 404", async () => {
  const r = await fetch(`${baseUrl}/attivita/inesistente`, { redirect: "manual" });
  assert.equal(r.status, 404, `expected 404, got ${r.status}`);
});

test("GET /avvocato-<slug> returns 301", async () => {
  const r = await fetch(`${baseUrl}/avvocato-mario-rossi`, { redirect: "manual" });
  assert.equal(r.status, 301, `expected 301, got ${r.status}`);
  const loc = r.headers.get("location") || "";
  assert.match(
    loc,
    /^\/professionisti(\/[a-z0-9-]+)?$/,
    `unexpected redirect target: ${loc}`,
  );
});

test("GET /wp-login.php returns 410", async () => {
  const r = await fetch(`${baseUrl}/wp-login.php`, { redirect: "manual" });
  assert.equal(r.status, 410, `expected 410, got ${r.status}`);
});

test("GET /?p=123 returns 301 to /", async () => {
  const r = await fetch(`${baseUrl}/?p=123`, { redirect: "manual" });
  assert.equal(r.status, 301, `expected 301, got ${r.status}`);
  assert.equal(r.headers.get("location"), "/");
});
