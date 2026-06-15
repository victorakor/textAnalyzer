/**
 * app.js
 * Main application controller.
 *
 * Responsibilities:
 *  - Wire up UI controls (run, clear, paste, copy, download, samples)
 *  - Send input + auto-format mode to the backend for tag resolution
 *  - Fall back to an offline demo formatter if no backend is reachable
 *  - Keep the status indicator / char count / result meta in sync
 *
 * --------------------------------------------------------------------
 * BACKEND CONTRACT (adjust BACKEND_URL to match your Go server)
 *
 *   POST {BACKEND_URL}
 *   Content-Type: application/json
 *
 *   Request body:
 *     {
 *       "text": "<raw input text>",
 *       "autoFormat": "off" | "standard" | "title" | "condensed"
 *     }
 *
 *   Response body:
 *     {
 *       "result": "<formatted output text>"
 *     }
 *
 *   On error, respond with a non-2xx status and optionally:
 *     { "error": "<message>" }
 * --------------------------------------------------------------------
 */

(function () {
  // Point this at your Go backend's endpoint, e.g. "http://localhost:8080/format"
  const BACKEND_URL = '/format'; // null => offline demo mode

  const els = {
    input: document.getElementById('inputText'),
    output: document.getElementById('outputText'),
    autoFormat: document.getElementById('autoFormat'),
    btnRun: document.getElementById('btnRun'),
    btnClear: document.getElementById('btnClear'),
    btnPaste: document.getElementById('btnPaste'),
    btnCopy: document.getElementById('btnCopy'),
    btnDownload: document.getElementById('btnDownload'),
    charCount: document.getElementById('charCount'),
    resultMeta: document.getElementById('resultMeta'),
    statusDot: document.getElementById('statusDot'),
    statusLabel: document.getElementById('statusLabel'),
    footerStatus: document.getElementById('footerStatus'),
    toast: document.getElementById('toast'),
    sampleChips: document.querySelectorAll('.sample-chip'),
  };

  let toastTimer = null;

  // ---------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------

  TextFlowHighlighter.initHighlighter(els.input);

  setStatus(BACKEND_URL ? 'idle' : 'demo');
  updateCharCount();

  // Ping the backend on load so the status dot turns green immediately
  // if Go is already running, rather than waiting for the first Run click.
  if (BACKEND_URL) {
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'ping', autoFormat: 'off' }),
    })
      .then((r) => { if (r.ok) setStatus('ready'); })
      .catch(() => { /* backend not up yet — stays 'idle' */ });
  }

  // Re-run on next frame in case the textarea was pre-filled by the
  // browser (autofill / restored form state) before listeners attached.
  requestAnimationFrame(updateCharCount);

  // ---------------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------------

  els.input.addEventListener('input', updateCharCount);

  els.input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runFormat();
    }
  });

  els.btnRun.addEventListener('click', runFormat);

  els.btnClear.addEventListener('click', () => {
    els.input.value = '';
    els.input.dispatchEvent(new Event('input'));
    els.input.focus();
    resetOutput();
  });

  els.btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      els.input.value = text;
      els.input.dispatchEvent(new Event('input'));
      showToast('Pasted from clipboard');
    } catch {
      showToast('Clipboard access denied');
    }
  });

  els.btnCopy.addEventListener('click', async () => {
    const text = els.output.dataset.plainText || '';
    if (!text) {
      showToast('Nothing to copy yet');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed');
    }
  });

  els.btnDownload.addEventListener('click', () => {
    const text = els.output.dataset.plainText || '';
    if (!text) {
      showToast('Nothing to download yet');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'textflow-result.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Downloaded result.txt');
  });

  els.sampleChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.sample;
      const sample = TEXTFLOW_SAMPLES[key];
      if (!sample) return;
      els.input.value = sample;
      els.input.dispatchEvent(new Event('input'));
      resetOutput();
      els.input.focus();
      runFormat();
    });
  });

  // ---------------------------------------------------------------
  // Core actions
  // ---------------------------------------------------------------

  function updateCharCount() {
    const len = els.input.value.length;
    els.charCount.textContent = `${len} char${len === 1 ? '' : 's'}`;
  }

  function resetOutput() {
    els.output.innerHTML =
      '<p class="result-placeholder">Your formatted text will compile here. Hit <kbd>run</kbd> or <kbd>ctrl + enter</kbd> to process.</p>';
    els.output.dataset.plainText = '';
    els.resultMeta.textContent = 'awaiting input';
  }

  async function runFormat() {
    const raw = els.input.value;

    if (!raw.trim()) {
      showToast('Add some text first');
      return;
    }

    setStatus('busy');
    els.btnRun.classList.add('is-busy');
    els.resultMeta.textContent = 'processing…';

    const mode = els.autoFormat.value;

    try {
      let result;

      if (BACKEND_URL) {
        result = await callBackend(raw, mode);
      } else {
        // Offline demo: resolve tags, then apply the chosen auto-format pass.
        const resolved = TextFlowFormatter.demoResolveTags(raw);
        result = TextFlowFormatter.applyAutoFormat(resolved, mode);
      }

      renderResult(result);
      setStatus(BACKEND_URL ? 'ready' : 'demo');
    } catch (err) {
      console.error(err);
      showToast('Formatting failed — check backend connection');
      setStatus('error');
    } finally {
      els.btnRun.classList.remove('is-busy');
    }
  }

  async function callBackend(text, autoFormat) {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, autoFormat }),
    });

    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }

    const data = await res.json();
    return data.result ?? '';
  }

  function renderResult(text) {
    els.output.dataset.plainText = text;
    els.output.textContent = text;

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    els.resultMeta.textContent = `${words} word${words === 1 ? '' : 's'} · ${chars} char${chars === 1 ? '' : 's'}`;
  }

  // ---------------------------------------------------------------
  // Status indicator
  // ---------------------------------------------------------------

  function setStatus(state) {
    const map = {
      idle: { label: 'engine idle', dot: '' , footer: 'engine: idle'},
      busy: { label: 'processing…', dot: 'is-busy', footer: 'engine: processing' },
      ready: { label: 'engine ready', dot: 'is-ready', footer: 'engine: connected' },
      error: { label: 'connection error', dot: '', footer: 'engine: error' },
      demo: { label: 'offline demo mode', dot: 'is-ready', footer: 'engine: offline demo' },
    };

    const conf = map[state] || map.idle;
    els.statusLabel.textContent = conf.label;
    els.statusDot.className = `status-dot ${conf.dot}`.trim();
    els.footerStatus.textContent = conf.footer;
  }

  // ---------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('is-visible');
    }, 2200);
  }
})();
