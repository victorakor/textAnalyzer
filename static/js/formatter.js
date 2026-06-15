/**
 * formatter.js
 * Frontend-side text utilities.
 *
 * The actual tag-resolution engine — (hex), (bin), (up), (low), (cap),
 * punctuation spacing, quote pairing, a/an correction — runs server-side
 * in Go. This module is responsible for everything the frontend owns:
 *
 *  1. "Auto-format" presets applied client-side, on top of (or instead of)
 *     the server's tag resolution:
 *       - off:       send the raw text untouched
 *       - standard:  collapse whitespace, trim, ensure single spaces
 *       - title:     standard + title-cases the first line (treated as
 *                     a heading) and sentence-cases the rest
 *       - condensed: standard + collapses multiple blank lines and
 *                     trims trailing spaces per line
 *
 *  2. A small offline demo formatter, used only when no backend is
 *     configured, so the UI is fully explorable without Go running.
 */

(function () {
  const SMALL_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'for', 'so', 'yet',
    'to', 'of', 'in', 'on', 'at', 'by', 'up', 'as', 'is', 'it',
  ]);

  /** Collapse runs of whitespace (except newlines) into single spaces. */
  function collapseSpaces(text) {
    return text
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n');
  }

  /** Collapse 3+ consecutive newlines down to a single blank line. */
  function collapseBlankLines(text) {
    return text.replace(/\n{3,}/g, '\n\n');
  }

  /** Title-case a single line, keeping small words lowercase mid-sentence. */
  function toTitleCase(line) {
    const words = line.toLowerCase().split(' ');
    return words
      .map((word, i) => {
        if (!word) return word;
        if (i !== 0 && i !== words.length - 1 && SMALL_WORDS.has(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /** Ensure the first letter of each sentence is capitalized. */
  function sentenceCase(text) {
    return text.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
  }

  /**
   * Applies the selected auto-format preset to raw text.
   * @param {string} text
   * @param {'off'|'standard'|'title'|'condensed'} mode
   * @returns {string}
   */
  function applyAutoFormat(text, mode) {
    if (mode === 'off' || !text) return text;

    let result = text;

    switch (mode) {
      case 'standard':
        result = collapseSpaces(result);
        result = sentenceCase(result);
        break;

      case 'title': {
        result = collapseSpaces(result);
        const lines = result.split('\n');
        if (lines.length > 0) {
          lines[0] = toTitleCase(lines[0]);
        }
        for (let i = 1; i < lines.length; i++) {
          lines[i] = sentenceCase(lines[i]);
        }
        result = lines.join('\n');
        break;
      }

      case 'condensed':
        result = collapseSpaces(result);
        result = collapseBlankLines(result);
        result = sentenceCase(result);
        break;

      default:
        break;
    }

    return result;
  }

  /**
   * Minimal offline demo: resolves the core tag set client-side so the
   * interface is usable before a backend is wired up. This intentionally
   * does NOT aim to be a full reimplementation of the Go engine — it
   * covers the common cases for demo purposes only.
   * @param {string} text
   * @returns {string}
   */
  function demoResolveTags(text) {
    let result = text;

    // (hex) — word before becomes decimal
    result = result.replace(/(\S+)\s*\(hex\)/gi, (_, word) => {
      const n = parseInt(word, 16);
      return Number.isNaN(n) ? word : String(n);
    });

    // (bin) — word before becomes decimal
    result = result.replace(/(\S+)\s*\(bin\)/gi, (_, word) => {
      const n = parseInt(word, 2);
      return Number.isNaN(n) ? word : String(n);
    });

    // (up, n) / (low, n) / (cap, n) — apply to previous n words
    result = result.replace(
      /((?:\S+\s+){0,9}\S+)\s*\((up|low|cap)\s*,\s*(\d+)\)/gi,
      (_, span, op, countStr) => {
        const count = parseInt(countStr, 10);
        const words = span.trim().split(/\s+/);
        const target = words.slice(-count);
        const rest = words.slice(0, -count);
        const transformed = target.map((w) => transformWord(w, op));
        return [...rest, ...transformed].join(' ');
      }
    );

    // (up) / (low) / (cap) — apply to single previous word
    result = result.replace(/(\S+)\s*\((up|low|cap)\)/gi, (_, word, op) =>
      transformWord(word, op)
    );

    // a -> an before vowel-sound or silent-h words
    result = result.replace(/\b([aA])\s+(?=[aeiouAEIOU]|h[aeiou])/g, (m, a) =>
      a === 'A' ? 'An ' : 'an '
    );

    // Quote pairs: ' word(s) ' -> 'word(s)'
    result = result.replace(/'\s*([^']+?)\s*'/g, (_, inner) => `'${inner.trim()}'`);

    // Punctuation spacing: tighten before, single space after
    result = result.replace(/\s*([.,!?:;])(?!\.)/g, '$1');
    result = result.replace(/([.,!?:;])(?!\s|$|\.)/g, '$1 ');

    // Preserve runs like ... or !? glued together
    result = result.replace(/([.!?:;,])\s+(?=[.!?])/g, '$1');

    return result.trim();
  }

  function transformWord(word, op) {
    switch (op.toLowerCase()) {
      case 'up':
        return word.toUpperCase();
      case 'low':
        return word.toLowerCase();
      case 'cap':
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      default:
        return word;
    }
  }

  window.TextFlowFormatter = {
    applyAutoFormat,
    demoResolveTags,
  };
})();
