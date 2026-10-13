// k6 load test for the game flow. Run: k6 run -e BASE_URL=https://staging.example scripts/load/k6-game-flow.js
import http from "k6/http";
import { check, sleep } from "k6";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
  scenarios: {
    players: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: Number(__ENV.VUS || 50) },
        { duration: __ENV.DURATION || "3m", target: Number(__ENV.VUS || 50) },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<300"],
    "http_req_duration{endpoint:answer}": ["p(95)<150"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:4000";
const headers = { "Content-Type": "application/json" };

export default function () {
  const health = http.get(`${BASE}/health`);
  check(health, { "health 200": (r) => r.status === 200 });

  // Authenticated flow is exercised once the API exposes /v1/games and a test-user token is provided.
  if (__ENV.TOKEN) {
    const auth = { ...headers, Authorization: `Bearer ${__ENV.TOKEN}` };
    const start = http.post(
      `${BASE}/v1/games`,
      JSON.stringify({ entryLevel: 300, category: "general-knowledge" }),
      { headers: { ...auth, "Idempotency-Key": uuidv4() }, tags: { endpoint: "start" } },
    );
    check(start, { "game started": (r) => r.status === 200 || r.status === 201 });
    if (start.status < 300) {
      const q = start.json();
      const ans = http.post(
        `${BASE}/v1/games/${q.id}/answers`,
        JSON.stringify({ questionId: q.question.questionId, optionId: q.question.options[0].id }),
        { headers: auth, tags: { endpoint: "answer" } },
      );
      check(ans, { "answer accepted": (r) => r.status === 200 });
    }
  }
  sleep(1);
}
