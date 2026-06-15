/**
 * highlighter.js
 * Signature feature: lightweight live highlighting of TextFlow's inline
 * tag syntax — (hex), (bin), (up), (low), (cap), (up, n) etc. — plus the
 * quote-pair markers, rendered as an overlay behind the textarea.
 *
 * The overlay mirrors the textarea's text exactly (same font, padding,
 * line-height) so highlighted spans line up perfectly with the caret.
 */

(function () {
  const TAG_PATTERN = /\((?:hex|bin|up|low|cap)(?:\s*,\s*\d+)?\)/gi;
  const QUOTE_PATTERN = /'/g;

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Builds the highlighted HTML for a raw input string.
   * @param {string} raw
   * @returns {string} HTML-safe markup with <span> highlights
   */
  function buildHighlightedHtml(raw) {
    if (!raw) return '';

    // Escape first, then re-insert highlight spans on the escaped text.
    // Tag/quote patterns only contain ASCII chars unaffected by escaping,
    // so running the regex after escaping is safe.
    const escaped = escapeHtml(raw);

    let html = escaped.replace(TAG_PATTERN, (match) =>
      `<span class="highlight-tag">${match}</span>`
    );

    html = html.replace(QUOTE_PATTERN, (match) =>
      `<span class="highlight-quote">${match}</span>`
    );

    // Preserve trailing newline rendering inside a <pre>-like container.
    return html + (raw.endsWith('\n') ? '\n' : '');
  }

  /**
   * Initializes a highlight overlay for a given textarea.
   * Creates an overlay element, keeps it in sync with content and scroll.
   * @param {HTMLTextAreaElement} textarea
   */
  function initHighlighter(textarea) {
    const wrapper = document.createElement('div');
    wrapper.className = 'highlight-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.flex = '1';
    wrapper.style.display = 'flex';

    const overlay = document.createElement('div');
    overlay.className = 'highlight-overlay raw-input';
    overlay.setAttribute('aria-hidden', 'true');

    // Overlay sits behind the (transparent-background) textarea.
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.margin = '0';
    overlay.style.overflow = 'hidden';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.wordBreak = 'break-word';
    overlay.style.pointerEvents = 'none';
    overlay.style.color = 'transparent';

    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(overlay);
    wrapper.appendChild(textarea);

    textarea.style.position = 'relative';
    textarea.style.background = 'transparent';
    textarea.style.zIndex = '1';

    // The inset background now lives on the wrapper instead of the textarea.
    wrapper.style.background = 'var(--bg-inset)';

    function sync() {
      overlay.innerHTML = buildHighlightedHtml(textarea.value) + '\u200b';
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    }

    textarea.addEventListener('input', sync);
    textarea.addEventListener('scroll', () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    });

    sync();

    return { sync };
  }

  window.TextFlowHighlighter = { initHighlighter, buildHighlightedHtml };
})();
