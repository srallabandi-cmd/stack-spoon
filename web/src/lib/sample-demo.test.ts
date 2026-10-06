import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEMO_LABEL,
  SAMPLE_STORAGE_KEY,
  SOURCE_BLOCKS,
  TASK_NAME,
  briefMarkdown,
  createSampleDemo,
  editProposal,
  evidenceMatchesSource,
  includeInBrief,
  isSampleDemoState,
  rejectProposal,
  restartSample,
  simulateTicket,
  TICKET_PROPOSAL_ID,
} from "./sample-demo.ts";

test("evidence excerpts are exact slices of the displayed source", () => {
  const state = createSampleDemo();
  assert.equal(evidenceMatchesSource(state), true);
  for (const proposal of state.proposals) {
    const block = SOURCE_BLOCKS.find((item) => item.id === proposal.sourceId);
    assert.ok(block);
    assert.equal(block.text.includes(proposal.evidence), true);
    assert.equal(block.text.slice(block.text.indexOf(proposal.evidence), block.text.indexOf(proposal.evidence) + proposal.evidence.length), proposal.evidence);
  }
});

test("including the same item twice does not duplicate it", () => {
  const once = includeInBrief(createSampleDemo(), "missing-owner");
  const twice = includeInBrief(once, "missing-owner");
  const bullets = briefMarkdown(twice).match(/Customer email has no owner/g) ?? [];
  assert.equal(bullets.length, 1);
});

test("an edit included in the brief is kept, and a rejected item stays out", () => {
  let state = createSampleDemo();
  const edited = "Priya sends the customer email. Jordan drafts it.";
  state = editProposal(state, "missing-owner", edited);
  state = includeInBrief(state, "missing-owner");
  state = includeInBrief(state, TICKET_PROPOSAL_ID);
  state = rejectProposal(state, "hold-pricing");
  const markdown = briefMarkdown(state);
  const included = markdown.split("## Left out")[0];
  assert.match(included, new RegExp(edited));
  assert.doesNotMatch(included, /Hold the pricing page/);
  assert.match(markdown, /## Left out\n\n- Hold the pricing page/);
  assert.doesNotMatch(markdown, /Keep the pricing page unpublished/);
});

test("repeated ticket approval stores one local preview and no issue id", () => {
  const state = editProposal(
    createSampleDemo(),
    TICKET_PROPOSAL_ID,
    "Send the Thursday beta note after the owner is named."
  );
  const once = simulateTicket(state, TICKET_PROPOSAL_ID);
  const twice = simulateTicket(once, TICKET_PROPOSAL_ID);
  assert.equal(twice, once);
  assert.ok(once.simulatedTicket);
  assert.equal(once.simulatedTicket?.destination, "Linear · Northwind (fictional)");
  assert.match(once.simulatedTicket?.body ?? "", /Send the Thursday beta note/);
  assert.doesNotMatch(JSON.stringify(once.simulatedTicket), /LIN-/);
  const markdown = briefMarkdown(once);
  assert.equal(markdown.split("Simulated ticket; nothing sent.").length - 1, 1);
});

test("restart clears sample decisions only", () => {
  const dirty = simulateTicket(
    includeInBrief(createSampleDemo(), "missing-owner"),
    TICKET_PROPOSAL_ID
  );
  const fresh = restartSample();
  assert.notDeepEqual(dirty, fresh);
  assert.deepEqual(fresh, createSampleDemo());
  assert.equal(fresh.simulatedTicket, null);
  assert.ok(Object.values(fresh.decisions).every((decision) => decision === "pending"));
  assert.equal(JSON.stringify(fresh).includes("stack-spoon-workspace"), false);
});

test("sample files do not call live APIs or the signed-in workspace", () => {
  const page = readFileSync(new URL("../app/sample/page.tsx", import.meta.url), "utf8");
  const lib = readFileSync(new URL("./sample-demo.ts", import.meta.url), "utf8");
  const store = readFileSync(new URL("./store.tsx", import.meta.url), "utf8");
  for (const source of [page, lib]) {
    assert.doesNotMatch(source, /fetch\s*\(/);
    assert.doesNotMatch(source, /\/api\//);
    assert.doesNotMatch(source, /useWorkspace/);
    assert.doesNotMatch(source, /localStorage/);
    assert.doesNotMatch(source, /confidence/i);
  }
  assert.match(store, /stack-spoon-workspace-v2/);
  assert.match(store, /pathname\.startsWith\("\/sample"\)/);
  assert.notEqual(SAMPLE_STORAGE_KEY, "stack-spoon-workspace-v2");
  assert.match(page, /sessionStorage/);
  assert.match(page, /\{DEMO_LABEL\}/);
  assert.match(page, /\{TASK_NAME\}/);
  assert.match(lib, new RegExp(DEMO_LABEL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lib, new RegExp(TASK_NAME.replace(".", "\\.")));
});

test("landing keeps role browsing and links the sample", () => {
  const landing = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(landing, /href="\/start"/);
  assert.match(landing, /href="\/sample"/);
  assert.match(landing, /Try a sample workflow/);
});

test("invalid saved sample state is rejected", () => {
  assert.equal(isSampleDemoState(null), false);
  assert.equal(isSampleDemoState({ proposals: [], decisions: {}, simulatedTicket: null }), false);
  const state = createSampleDemo();
  assert.equal(isSampleDemoState(state), true);
  state.proposals[0].evidence = "not in the source";
  assert.equal(isSampleDemoState(state), false);
});
