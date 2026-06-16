# TextFlow — Frontend

Static frontend for TextFlow, a markup-driven text formatter. Pairs with a Go backend that performs the actual rule processing.

## Structure

```
textflow/
├── index.html
├── css/
│   ├── reset.css        # baseline reset
│   ├── variables.css     # design tokens (color, type, spacing)
│   ├── layout.css        # topbar, hero, footer, toast
│   ├── components.css    # buttons, legend cards, section headings
│   ├── editor.css         # split-pane editor (signature element)
│   ├── feature.css        # features/about page
│   └── responsive.css     # breakpoints
└── js/
    ├── navigation.js   # home <-> features view switching
    ├── samples.js      # sample text snippets for the chips
    ├── highlighter.js  # live tag-syntax highlighting overlay
    ├── formatter.js    # client-side auto-format presets + offline demo
    └── app.js          # main controller, event wiring, backend calls
```

## Backend integration

Set `BACKEND_URL` at the top of `js/app.js` to your Go server's endpoint
(e.g. `http://localhost:8080/format`). While `BACKEND_URL` is `null`, the
UI runs in offline demo mode using a JS reimplementation of the core rules
in `formatter.js` — useful for previewing the UI without a server running.

### Request

```
POST {BACKEND_URL}
Content-Type: application/json

{
  "text": "<raw input text>",
  "autoFormat": "off" | "standard" | "title" | "condensed"
}
```

`autoFormat` reflects the dropdown in the input pane:

- `off` — apply only the tag rules ((hex), (bin), (up)/(low)/(cap),
  punctuation spacing, quote pairing, a/an correction).
- `standard` — the above, plus standard English cleanup (whitespace
  normalization, sentence casing).
- `title` — standard, with the first line treated as a title/heading.
- `condensed` — standard, plus collapsing extra blank lines.

The exact behavior of each mode beyond tag resolution is up to the backend;
the frontend only sends the selected mode as a string.

### Response

```
{
  "result": "<formatted output text>"
}
```

Non-2xx responses should optionally include `{ "error": "<message>" }`.
The frontend shows a toast and reverts to demo mode on any failure.

## Notes

- All inline tag syntax — `(hex)`, `(bin)`, `(up)`, `(low)`, `(cap)`,
  `(up, n)`, `(low, n)`, `(cap, n)` — is highlighted live in the input
  pane as the user types (see `highlighter.js`).
- Output supports copy-to-clipboard and download as `.txt`.
- Keyboard shortcut: `Ctrl/Cmd + Enter` runs the formatter.


# live demonstration
`https://textanalyzer-production-ed08.up.railway.app/`