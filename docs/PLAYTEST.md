# First playtest — 5–10 people, five minutes each

## Build and invitation

Use the release identified by package.json and the bottom-right footer. The current public-link status is maintained in [RELEASE_STATUS.md](RELEASE_STATUS.md). **Do not send the invitation until the actual public URL has been verified and inserted below.** A localhost link will not work for other people.

Copy-ready invitation (replace the clearly marked link first):

> Would you try SIGNAL / 03, a small browser game, for five minutes? Play here: [INSERT VERIFIED PUBLIC URL]. Please try playing before reading the rules or asking me what to do. There are only demo credits—no purchases, prizes or account. Afterwards, tell me what was clear, what felt awkward, how the sound felt, and what made you stop. A phone or laptop is fine. Please include your device/browser and the version shown at the bottom-right. Honest confusion is useful; you are testing the game, not yourself.

Choose 5–10 consenting adults for this first round, preferably a mix of people who play browser games and people who do not, with at least two different phones and a keyboard user if available. This is a small usability round, not a representative player study. No invitations have been sent and no participants or feedback are implied by this document.

## Five-minute session

1. **0:00–0:30 — first impression.** Share only the link. Ask “What do you think you can do here?” Avoid coaching. Observe whether they find SPIN, and whether they try to read the center or adjacent symbols.
2. **0:30–2:00 — unguided play.** Ask them to play as they normally would. Note pauses, repeated clicks, mistaken payout expectations and whether the result text helps. Do not force favorable outcomes or explain a pair before it appears naturally.
3. **2:00–3:00 — understanding and controls.** Ask them to explain which symbols count, the cost and the award for a pair/triple. Ask them to find mute, adjust volume and reset. If no match type appeared, ask about its written rule rather than claiming they experienced it.
4. **3:00–4:00 — feel.** Ask whether presses registered, whether waiting felt too long or too short, whether sound was comfortable and whether a refund felt distinct from a win. If available, ask a keyboard user to try Space and focus navigation; record their actual device and settings.
5. **4:00–5:00 — stop and reflect.** “What made you want to stop? What would you change first? Would you press SPIN again, and why?” Capture one specific observation and one possible fix. Ask permission before retaining a screenshot; do not request identifying information or record the person automatically.

## Questions to ask without suggesting an answer

- What does a spin cost? Which visible symbols determine the result?
- What do you think happened to your balance on the last spin?
- Did every press feel acknowledged? Was there a moment you thought the game was stuck?
- What did the sound tell you? Would you keep it on? Was any cue unpleasant?
- Which result was most satisfying? Was any response misleading or too strong?
- Did any text, symbol or control feel too small on your device?
- What caused you to stop: understanding, repetition, waiting, discomfort, another task, or something else? Let the person answer before offering categories.

## Feedback record

Keep the following header in a local spreadsheet or Markdown table. Use anonymous IDs such as P01. No observations have been entered yet.

| Participant ID | Device / browser | Footer version | Observation (what happened) | Severity | Reproduction steps | Evidence / consent |
| --- | --- | --- | --- | --- | --- | --- |

Severity: **Blocker** = cannot start/finish a spin, credit corruption or crash. **Major** = a core rule/control is misunderstood or unusable. **Minor** = awkward spacing, timing or copy while play remains possible. **Preference** = subjective taste without a demonstrated failure. Do not turn every preference into a defect.

Store raw notes privately; do not commit participant details, private screenshots or contact information to the public repository. Only publish an anonymized summary with consent and distinguish verbatim observations from interpretation.

## Grouping findings and choosing a patch

After all sessions, group observations by user problem rather than proposed feature: e.g. “adjacent symbols treated as payable,” “mute hard to find,” or “no visible acknowledgement.” Count **distinct participants**, not the number of repeated comments from one person. Record affected versions and whether the issue is reproducible on another device.

Fix blockers first, then recurring major issues, then low-cost minor polish supported by observations. For each selected fix, write the observed problem, evidence count, smallest change and a retest criterion. Limit the next patch to roughly three well-supported changes; put unvalidated new gameplay ideas in a later backlog. Re-run the existing verification command and retest with 2–3 participants before calling a fix effective.

The original plan targeted playtest fixes for **v0.1.1**. Release preparation now uses that patch for dependency notices and repository hygiene, so first-round playtest fixes should use **v0.1.2** (or the next unpublished patch). Do not rewrite a published version. Added gameplay features require the minor-version policy and separate evidence.

No analytics, accounts, recruitment messages or automated feedback collection are installed by this plan.
