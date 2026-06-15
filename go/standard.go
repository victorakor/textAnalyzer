package app

import "strings"

func standard(str string) string {
	sliceOfSentences := strings.Fields(str)
	for i := 0; i < len(sliceOfSentences); i++ {
		word := sliceOfSentences[i]
		if len(word) == 0 {
			continue
		}

		// Capitalise the very first word
		if i == 0 {
			sliceOfSentences[i] = strings.ToUpper(string(word[0])) + strings.ToLower(word[1:])
		}

		// Capitalise the word after sentence-ending punctuation
		lastChar := word[len(word)-1]
		if strings.ContainsRune(punctMarks, rune(lastChar)) {
			if i+1 < len(sliceOfSentences) && len(sliceOfSentences[i+1]) > 0 {
				next := sliceOfSentences[i+1]
				sliceOfSentences[i+1] = strings.ToUpper(string(next[0])) + strings.ToLower(next[1:])
			}
		}
	}
	return strings.Join(sliceOfSentences, " ")
}

// titleCase applies proper title casing (capitalise each word except small words mid-sentence).
func titleCase(str string) string {
	small := map[string]bool{
		"a": true, "an": true, "the": true, "and": true, "but": true,
		"or": true, "nor": true, "for": true, "so": true, "yet": true,
		"at": true, "by": true, "in": true, "of": true, "on": true,
		"to": true, "up": true, "as": true,
	}
	words := strings.Fields(str)
	for i, w := range words {
		lower := strings.ToLower(w)
		if i == 0 || i == len(words)-1 || !small[lower] {
			if len(w) > 0 {
				words[i] = strings.ToUpper(string(w[0])) + strings.ToLower(w[1:])
			}
		} else {
			words[i] = lower
		}
	}
	return strings.Join(words, " ")
}
