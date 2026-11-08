# Ground Truth for ReliefWeb (prototype)

A browser extension for panel experts. On a ReliefWeb report, it shows a quiet tab at the
bottom right when ACAPS has a question this week on the report's country. From the tab the
expert can answer that question, and flag the report as evidence that raises or lowers a risk.

## Load it

1. Run the app: `npm run dev` in the project root.
2. Open `chrome://extensions` (or `edge://extensions`), turn on **Developer mode**,
   click **Load unpacked** and pick this `extension` folder.
3. Open any ReliefWeb report on Chad, for example a page under `https://reliefweb.int/report/chad/`.

The extension finds the app on `localhost:3000`, `3001` or `3220` by itself. Another address can
be set from the toolbar icon. If the app is not running, the tab shows a bundled snapshot of the
sample questions (`sample.json`) and says so.

## What it touches

- Runs only on `https://reliefweb.int/report/*`. It reads that page's URL and country tags, nothing else.
- Nothing is sent until the expert presses send. Requests go from the extension's background
  worker to the Ground Truth app, never from the ReliefWeb page.
- Answers and flags go to `/api/answers` and `/api/evidence`, which are simulated in this draft.

## Files

- `manifest.json`: Manifest V3, ReliefWeb reports only, `storage` permission.
- `content.js`: the tab and panel, drawn in a shadow root so ReliefWeb's styles and ours never mix.
- `background.js`: finds the app, fetches questions, posts answers and flags.
- `popup.html`, `popup.js`: connection status and app address.
- `sample.json`: offline snapshot of `/api/questions?places=chad`.
