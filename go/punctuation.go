package app

import (
	"strings"
	"unicode"
)

const punctMarks = ".,!?:;"

func isPunctRune(r rune) bool {
	return strings.ContainsRune(punctMarks, r)
}

// isPunctuationRun returns true if every rune in s is a punctuation mark.
func isPunctuationRun(s string) bool {
	if s == "" {
		return false
	}
	for _, r := range s {
		if !isPunctRune(r) {
			return false
		}
	}
	return true
}

// splitLeadingPunctuation splits a token like ",what" into [",", "what"].
// Only splits when the token is not entirely punctuation (to keep "..." intact)
// and not a quote mark.
func splitLeadingPunctuation(token string) []string {
	if token == "'" || isPunctuationRun(token) {
		return []string{token}
	}
	runes := []rune(token)
	end := 0
	for end < len(runes) && isPunctRune(runes[end]) {
		end++
	}
	if end == 0 {
		return []string{token}
	}
	return []string{string(runes[:end]), string(runes[end:])}
}

func Punctuation(str string) string {
	raw := strings.Fields(str)

	// Pre-pass: split tokens where punctuation is glued to the front (e.g. ",what")
	var tokens []string
	for _, t := range raw {
		tokens = append(tokens, splitLeadingPunctuation(t)...)
	}

	inquote := false

	for i := 0; i < len(tokens); i++ {
		val := tokens[i]

		if i > 0 {
			// Attach trailing punctuation runs to the previous token
			if isPunctuationRun(val) && val != "'" {
				tokens[i-1] = tokens[i-1] + val
				tokens = append(tokens[:i], tokens[i+1:]...)
				i--
				continue
			}

			// Opening quote: prepend to the next token
			if val == "'" && !inquote {
				inquote = true
				if i+1 < len(tokens) {
					tokens[i+1] = val + tokens[i+1]
					tokens = append(tokens[:i], tokens[i+1:]...)
					i--
				}
				continue
			}

			// Closing quote: append to the previous token
			if val == "'" && inquote {
				inquote = false
				tokens[i-1] = tokens[i-1] + val
				tokens = append(tokens[:i], tokens[i+1:]...)
				i--
				continue
			}
		}

		// Capitalise the word after a sentence-ending punctuation character
		if i+1 < len(tokens) {
			lastRune := rune(val[len(val)-1])
			if !unicode.IsLetter(lastRune) && !unicode.IsDigit(lastRune) {
				// ends in punctuation — handled at the standard() level, not here
			}
		}
	}

	return strings.Join(tokens, " ")
}
