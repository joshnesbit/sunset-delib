# Key Common Ground · 共同點

A small, bilingual deliberation tool, in the style of Pol.is, for the parents and
teachers of **Francis Scott Key Elementary School** (1530 43rd Ave, Outer Sunset,
San Francisco). It asks one question:

> **What should technology and AI look like in our kids' classrooms at Francis Scott Key?**
> 我們孩子在 Francis Scott Key 的課堂上，科技與 AI 應該是什麼樣子？

People vote Agree / Disagree / Unsure on short statements, one at a time, and add
their own. Once enough people have voted, the tool groups people who vote alike
and shows **where the whole FSK community already agrees**, where parents and
teachers agree or differ, and what actually divides us. That shared ground
becomes FSK's written input to the SFUSD Board of Education before its
technology and AI policy vote.

Made with [Relational Builder](https://relationalbuilder.org), an open-source
app builder for tools that strengthen neighborhood connection.

---

## Why now

- **The board votes in March 2027.** SFUSD plans to adopt a technology and AI
  policy then. Until that vote, families are pointed to the district's existing
  generative-AI guidance.
- **AI is already in classrooms.** Examples include a district ChatGPT Edu
  contract for teachers and staff, and the Amira AI reading tutor, which is
  expanding in elementary classrooms. Both matter directly to a K–5 school like FSK.
- **Views are strong and they differ.** Parents organizing as Tech in Check want
  generative AI disabled on student devices, a return to shared device carts, and
  paper homework by default. UESF, the teachers' union, has questioned the
  evidence that these tools help. SF Parents Coalition has raised concerns about
  tools that record children's faces and voices. The district emphasizes
  flexibility because the tools are changing fast.

Group chats and public comment make these positions sound further apart than a
school community usually is. This tool is built to show the common ground.

Background reporting used to draft the seed statements:
[SFist on Superintendent Su, AI, and Salesforce](https://sfist.com/2026/09/21/sfusds-maria-su-talks-ai-in-schools-14-year-partnership-with-salesforce-at-dreamforce-conference/) ·
[SFGate on AI in SF schools](https://www.sfgate.com/tech/article/san-francisco-schools-ai-22435724.php).
None of the statements quote FSK families.

---

## How it works

1. **Pick a role.** Parent, teacher/staff, or both. There's no name, email, or sign-in.
2. **Vote on the deck.** Statements come one at a time, in an order shuffled per
   person, in English or Traditional Chinese (switch any time with 中文 / EN).
3. **Add a perspective.** Up to 160 characters, in either language, with no links.
   New statements go to a steward queue and don't enter the deck until a person
   has read, translated, and approved them.
4. **Results open at a threshold.** The report stays locked until **25 people
   have each answered 10+ statements**. Before that it shows honest progress
   ("17 of 25 so far") and never shows made-up groups.
5. **People name the groups.** The software finds groups. The editorial trio
   reads what sets each one apart and writes the names.
6. **Close the loop.** The report is read aloud at an FSK School Site Council
   meeting, then sent to the board and the Superintendent's office. Its "What
   happens next" strip (Heard · Doing · Changed · Expect next) is updated by the
   steward after the board votes.

### The method, in plain terms

- Each person's votes form a row in a vote matrix. Unanswered statements take the
  statement's average.
- PCA reduces those rows to 2 dimensions (the dot map on the report).
- k-means splits people into 2–4 groups. The number of groups is chosen by
  silhouette score, and every group needs at least 3 people.
- **Consensus** means at least 60% agree (or disagree) inside every group.
- **Divisive** means a gap of 30+ points in agreement between groups.
- **Parents vs. teachers** is calculated separately, by role, when at least 3 of each have voted.

All of this is in `src/lib/clustering.ts`: pure functions with no dependencies,
so the same file can later run server-side unchanged.

---

## Pages

| Route | What it's for |
|---|---|
| `#/` | Role pick, then the vote deck |
| `#/add` | Add your own statement (instructions shown the first time) |
| `#/report` | Public results, locked until the threshold is met |
| `#/report?demo=1` | The report run on **synthetic demo votes**, with a banner saying so. For showing the math to a room, never for real results |
| `#/steward` | Moderation queue and translation, flagged cards, group naming, CSV export |
| `#/about` | Who tends it, why now, how results work, the data promise |

## Files worth knowing

| File | What's in it |
|---|---|
| `src/data/statements.ts` | **The 43 bilingual seed statements** across 8 themes, drawn from FSK's draft *Tech With Intention* policy (v0.3). This is the file the editorial trio edits |
| `src/pages/Terms.tsx` | Terms of Use & Moderation Policy, linked from the add-a-statement screen |
| `src/lib/i18n.ts` | Every interface string in English and Traditional Chinese |
| `src/lib/store.ts` | Votes, participants, submissions, flags, synced to Community Cloud |
| `src/lib/cloud.ts` | Backend requests, paging, and the `STEWARDS` list |
| `cloud-schema.json` | Typed collections the backend validates on every write |
| `src/lib/clustering.ts` | PCA + k-means + consensus / divisive / role analysis |
| `src/lib/demoVotes.ts` | Synthetic vote matrix for `?demo=1` only. Never mixed with real votes |
| `src/index.css` | Design tokens: dune sand, driftwood brown, green Agree, coral Disagree |

### Editing the seed statements

Each statement has an `id`, English `en`, Chinese `zh`, a `theme`, and a `lean`
(`more`, `limits`, or `conditional`). The lean is used only to keep the set
balanced; participants never see it. Rules for the trio:

- **Keep it balanced:** about a third lean toward more tech use, a third toward
  limits, and a third conditional or about process.
- **One idea per statement,** stated as something a person could agree with.
- **Nothing that names a person,** and nothing written to steer people toward an answer.
- **A native reader checks every Chinese line** before launch.

---

## Current status: first build

**Working now:** the full vote loop in both languages, add-a-statement with
moderation, flagging, the threshold-gated report with groups, consensus,
parent/teacher comparison and divisions, the demo report, the steward page, and About.

**Not ready for families yet:**

- **No stewards are listed yet.** Votes and statements now go to the shared
  Community Cloud backend, and the steward page asks for email-code sign-in.
  Until emails are added to `STEWARDS` in `src/lib/cloud.ts`, nobody can moderate.
- **Anonymous writes are open.** Steward decisions only count when signed by a
  listed steward, but vote-stuffing is caught only by the fast-voter set-aside.
- **The Chinese is a first draft** and needs a native reader, both the interface
  text and the statements.
- **The About page says an FSK parent and teacher reviewed the statements.**
  That review hasn't happened. Do it before launch, or change the sentence.

## Launch checklist

- [ ] Editorial trio (Josh, one FSK teacher, one FSK parent, ideally a Cantonese
      speaker) reviews and edits `statements.ts`
- [ ] Native reader checks all Traditional Chinese
- [x] FSK steward named: Josh (josh@relationaltechproject.org), listed on About
- [ ] Josh's sign-in email added to `STEWARDS` in `src/lib/cloud.ts`
- [ ] In-person conversations at drop-off and pick-up, arranged by emailing Josh
- [ ] QR code on the 43rd Ave fence and in school newsletters, in both languages
- [ ] A two-week window, and a closing SSC or PTA meeting date (list it on
      [Outer Sunset Today](https://outersunset.today))
- [ ] After the board votes, the steward fills in "Doing" and "Changed" on the report

## Next

- Shared storage with steward sign-in, and clustering run on shared snapshots
  instead of one device

- Later: Spanish, a "does this reflect you?" reply on the report, a steward
  digest email, a public export of the anonymized results as an open dataset,
  and a remix guide for other SFUSD schools

---

## Principles behind it

Built in the Responsive Cities Studio. The principles that shaped real decisions:

- **Community in the loop.** A person approves every new statement and every
  translation, and people name the groups, not software.
- **Build for the resident who never calls 311.** It's bilingual from day one,
  it needs no account, and anyone who'd rather talk in person can email Josh
  to meet at drop-off or pick-up.
- **Glass box, not black box.** The method, the number of participants, and the
  stewards are on the page, and the report shows an honest locked state instead
  of fake results.

It moves FSK from **Inform/Consult** (a district guidance page and a board vote)
to **Involve**: the school community's shared ground shapes the input the board
receives, in public.

**Data promise:** no names, emails, or IP addresses. We keep role, language, and
votes only, stored anonymously in a shared community backend that anyone with
the app's ID can read. Nothing is sold, and nothing is used to train AI.

## Remixing for another school

Fork the repo, replace `src/data/statements.ts` with your school's seed set,
update the school name and address in `src/lib/i18n.ts` and `src/pages/About.tsx`,
and set your own board timeline in `src/pages/Report.tsx`. The clustering doesn't
need changes.

---

## Running it

    npm install
    npm run dev

## About this repo

This repo stays in sync with its Relational Builder project both ways:
changes made in the Builder push here automatically, and commits made
here are pulled back in.

The `.reltech.yml` manifest carries the project's lineage. On GitHub,
adding the `relational-tech` topic makes the project appear on
[updates.relationaltechproject.org](https://updates.relationaltechproject.org).