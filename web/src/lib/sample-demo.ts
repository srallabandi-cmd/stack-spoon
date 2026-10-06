export const DEMO_LABEL =
  "Interactive demo · fictional data · no external actions";

export const TASK_NAME = "Prepare a project update.";

export const SAMPLE_STORAGE_KEY = "stack-spoon-sample-demo-v1";

export const TICKET_DESTINATION = "Linear · Northwind (fictional)";

export const TICKET_PROPOSAL_ID = "beta-update";

export type SourceBlock = {
  id: string;
  speaker: string;
  text: string;
};

export const SOURCE_BLOCKS: SourceBlock[] = [
  {
    id: "note-priya",
    speaker: "Priya",
    text: "The staging deploy is green. We can tell the customer the beta is ready on Thursday.",
  },
  {
    id: "note-jordan",
    speaker: "Jordan",
    text: "Nobody owns the customer email. I can draft it, but someone has to send it.",
  },
  {
    id: "note-sam",
    speaker: "Sam",
    text: "Hold the pricing page. Legal has not signed the discount language.",
  },
];

export type SampleDecision = "pending" | "included" | "rejected";

export type SampleProposal = {
  id: string;
  title: string;
  preparedSummary: string;
  summary: string;
  sourceId: string;
  evidence: string;
  needsDecision: boolean;
};

export type SimulatedTicket = {
  proposalId: string;
  title: string;
  body: string;
  destination: string;
};

export type SampleDemoState = {
  proposals: SampleProposal[];
  decisions: Record<string, SampleDecision>;
  simulatedTicket: SimulatedTicket | null;
};

const PREPARED: Omit<SampleProposal, "summary">[] = [
  {
    id: TICKET_PROPOSAL_ID,
    title: "Share the Thursday beta update",
    preparedSummary:
      "Tell the customer the Northwind beta is ready on Thursday. Staging is green.",
    sourceId: "note-priya",
    evidence: "We can tell the customer the beta is ready on Thursday.",
    needsDecision: false,
  },
  {
    id: "missing-owner",
    title: "Customer email has no owner",
    preparedSummary:
      "The notes do not name who sends the customer email. Decide an owner before the update goes out.",
    sourceId: "note-jordan",
    evidence: "Nobody owns the customer email.",
    needsDecision: true,
  },
  {
    id: "hold-pricing",
    title: "Hold the pricing page",
    preparedSummary:
      "Keep the pricing page unpublished until legal signs the discount language.",
    sourceId: "note-sam",
    evidence: "Hold the pricing page.",
    needsDecision: false,
  },
];

export function createSampleDemo(): SampleDemoState {
  const proposals = PREPARED.map((item) => ({
    ...item,
    summary: item.preparedSummary,
  }));
  const decisions: Record<string, SampleDecision> = {};
  for (const proposal of proposals) decisions[proposal.id] = "pending";
  return { proposals, decisions, simulatedTicket: null };
}

export function restartSample(): SampleDemoState {
  return createSampleDemo();
}

function replaceProposal(
  state: SampleDemoState,
  id: string,
  summary: string
): SampleDemoState {
  return {
    ...state,
    proposals: state.proposals.map((proposal) =>
      proposal.id === id ? { ...proposal, summary } : proposal
    ),
  };
}

export function editProposal(
  state: SampleDemoState,
  id: string,
  summary: string
): SampleDemoState {
  if (!state.proposals.some((proposal) => proposal.id === id)) return state;
  return replaceProposal(state, id, summary);
}

function decide(
  state: SampleDemoState,
  id: string,
  decision: SampleDecision
): SampleDemoState {
  if (!state.proposals.some((proposal) => proposal.id === id)) return state;
  return {
    ...state,
    decisions: { ...state.decisions, [id]: decision },
  };
}

export function includeInBrief(state: SampleDemoState, id: string): SampleDemoState {
  return decide(state, id, "included");
}

export function rejectProposal(state: SampleDemoState, id: string): SampleDemoState {
  return decide(state, id, "rejected");
}

export function ticketDraft(proposal: SampleProposal): Omit<SimulatedTicket, "proposalId"> {
  return {
    title: proposal.title,
    body: `${proposal.summary}\n\nSource: "${proposal.evidence}"`,
    destination: TICKET_DESTINATION,
  };
}

export function simulateTicket(
  state: SampleDemoState,
  proposalId: string
): SampleDemoState {
  if (state.simulatedTicket) return state;
  if (proposalId !== TICKET_PROPOSAL_ID) return state;
  const proposal = state.proposals.find((item) => item.id === proposalId);
  if (!proposal) return state;
  const draft = ticketDraft(proposal);
  return {
    ...state,
    simulatedTicket: { proposalId, ...draft },
  };
}

export function sourceBlock(id: string): SourceBlock | undefined {
  return SOURCE_BLOCKS.find((block) => block.id === id);
}

export function evidenceMatchesSource(state: SampleDemoState): boolean {
  return state.proposals.every((proposal) => {
    const block = sourceBlock(proposal.sourceId);
    return Boolean(block && block.text.includes(proposal.evidence));
  });
}

export function briefMarkdown(state: SampleDemoState): string {
  const included = state.proposals.filter(
    (proposal) => state.decisions[proposal.id] === "included"
  );
  const rejected = state.proposals.filter(
    (proposal) => state.decisions[proposal.id] === "rejected"
  );
  const lines = [
    `# ${TASK_NAME}`,
    "",
    DEMO_LABEL,
    "",
    "Fictional project: Northwind launch.",
    "",
    "## Included",
    "",
  ];
  if (included.length === 0) {
    lines.push("Nothing included yet.", "");
  } else {
    for (const proposal of included) {
      lines.push(
        `- **${proposal.title}**`,
        `  ${proposal.summary}`,
        `  Source: "${proposal.evidence}"`,
        ""
      );
    }
  }
  lines.push("## Left out", "");
  if (rejected.length === 0) {
    lines.push("Nothing left out.", "");
  } else {
    for (const proposal of rejected) {
      lines.push(`- ${proposal.title}`, "");
    }
  }
  if (state.simulatedTicket) {
    lines.push(
      "## Follow-up ticket",
      "",
      "Simulated ticket; nothing sent.",
      "",
      `Title: ${state.simulatedTicket.title}`,
      "",
      state.simulatedTicket.body,
      "",
      `Destination: ${state.simulatedTicket.destination}`,
      ""
    );
  }
  return lines.join("\n");
}

export function isSampleDemoState(value: unknown): value is SampleDemoState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as SampleDemoState;
  if (!Array.isArray(candidate.proposals)) return false;
  if (candidate.proposals.length !== PREPARED.length) return false;
  if (!candidate.decisions || typeof candidate.decisions !== "object") return false;
  const ids = new Set(PREPARED.map((item) => item.id));
  for (const proposal of candidate.proposals) {
    if (!ids.has(proposal.id)) return false;
    if (typeof proposal.summary !== "string") return false;
    if (typeof proposal.evidence !== "string") return false;
    if (proposal.evidence !== PREPARED.find((item) => item.id === proposal.id)?.evidence) {
      return false;
    }
  }
  if (candidate.simulatedTicket !== null) {
    const ticket = candidate.simulatedTicket;
    if (!ticket || ticket.proposalId !== TICKET_PROPOSAL_ID) return false;
    if (ticket.destination !== TICKET_DESTINATION) return false;
    if (typeof ticket.title !== "string" || typeof ticket.body !== "string") return false;
  }
  return true;
}
