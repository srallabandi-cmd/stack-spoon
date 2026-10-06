import assert from "node:assert/strict";
import test from "node:test";
import { resolveWritebackResult, writebackNote } from "./writeback-result.ts";

test("a created write keeps only the server reference", () => {
  const result = resolveWritebackResult(200, {
    status: "created",
    externalRef: "LIN-1842",
  });
  assert.deepEqual(result, { status: "created", externalRef: "LIN-1842" });
});

test("a paused or failed live write never becomes a demo ticket", () => {
  const cases = [
    resolveWritebackResult(503, { error: "Write-back is paused (WRITEBACK_DISABLED)." } as never),
    resolveWritebackResult(503, { error: "Linear write-back is not configured." } as never),
    resolveWritebackResult(502, { status: "failed" }),
    resolveWritebackResult(401, { error: "Sign in required." } as never),
    resolveWritebackResult(500, {}),
  ];
  for (const result of cases) {
    assert.notEqual(result.status, "demo_created");
    assert.equal(result.externalRef, undefined);
    assert.doesNotMatch(writebackNote(result), /LIN-DEMO/);
    assert.match(result.status, /paused|failed/);
  }
  assert.equal(cases[0].status, "paused");
  assert.equal(cases[2].status, "failed");
});

test("not connected stays queued and does not invent an issue id", () => {
  const result = resolveWritebackResult(409, { queued: true });
  assert.deepEqual(result, { status: "queued" });
  assert.equal(writebackNote(result), "Queued until Linear connects.");
});
