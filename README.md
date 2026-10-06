# Stack Spoon

**We spoon-feed your work stack.**

The app lives in [`web/`](web/).

```bash
cd web && npm install && npm run dev
```

Local app: [http://127.0.0.1:3000](http://127.0.0.1:3000)

Local sample: [http://127.0.0.1:3000/sample](http://127.0.0.1:3000/sample)

Public sample: [https://stack-spoon.vercel.app/sample](https://stack-spoon.vercel.app/sample)

## Sample flow

The sample is a signed-out page. It does not install a role, create an account, call a model, or contact Slack or Linear.

1. From the landing page, choose **Try a sample workflow**. Role browsing stays on **Start with your role**.
2. The task is **Prepare a project update.** The source is a fictional Northwind launch check-in.
3. Three prepared sample outputs appear:
   - Share the Thursday beta update (an action).
   - Customer email has no owner, marked **Needs review**. The notes do not name an owner, and the sample does not invent one.
   - Hold the pricing page (an action).
4. Edit any output. **Include in brief** keeps that text in the brief. **Reject** lists it under **Left out**. Repeating either action does not add a second copy.
5. **Preview Linear ticket** shows a title, body, and the fictional destination `Linear · Northwind (fictional)` before **Simulate approval**. The result is **Simulated ticket; nothing sent.** A second approval does not create another ticket. There is no issue id.
6. The brief includes the label `Interactive demo · fictional data · no external actions`. **Copy** and **Download Markdown** report a result only after the action finishes. **Restart sample** clears sample session state only.

Every evidence quote is an exact slice of the notes on the page and links back to that note.

## Walkthrough

About 75 seconds. Include the pricing and legal hold. Do not reject it.

1. Open `/sample`. Read `Interactive demo · fictional data · no external actions`.
2. Read the task, **Prepare a project update.**, and the three Northwind notes.
3. On **Customer email has no owner**, show **Needs review**. The notes do not name an owner. Replace the text with `Human decision: Priya sends the customer email. Jordan drafts it.` Say that this owner assignment is a human decision.
4. Choose **Include in brief** for that item, then **Include in brief** for **Hold the pricing page**. Leave the legal hold in the brief.
5. Choose **Preview Linear ticket**. Read the title, body, and `Linear · Northwind (fictional)`, then **Simulate approval**. The result is **Simulated ticket; nothing sent.**
6. The brief shows the human owner decision and the legal hold once each, plus the demo label. Choose **Download Markdown**.
7. **Restart sample** restores only the sample.

## Simulated in this sample

- The project, notes, and prepared outputs.
- The Linear destination and the simulated ticket. Nothing is sent.
- Copy and download stay on this machine.

## Not verified as connected

Slack read, Linear write, and magic-link delivery to arbitrary inboxes are implemented in code. They are not verified as live here. A failed or paused Linear write stays failed or paused and does not invent a demo issue id. OAuth apps and a verified sending domain are still required before those connections can be treated as working.

Strategy research remains under `docs/`.
