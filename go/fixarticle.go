package app

import "strings"

func FixArticle(str string) string {
	sliceOfSentences := strings.Fields(str)
	vowels := "aeiouhAEIOUH"

	for i := 0; i < len(sliceOfSentences); i++ {
		if i+1 >= len(sliceOfSentences) {
			break
		}
		nextWord := sliceOfSentences[i+1]
		if len(nextWord) == 0 {
			continue
		}
		nextPrefix := nextWord[0]

		switch sliceOfSentences[i] {
		case "a":
			if strings.Contains(vowels, string(nextPrefix)) {
				sliceOfSentences[i] = "an"
			}
		case "A":
			if strings.Contains(vowels, string(nextPrefix)) {
				sliceOfSentences[i] = "An"
			}
		case "an":
			if !strings.Contains(vowels, string(nextPrefix)) {
				sliceOfSentences[i] = "a"
			}
		case "An":
			if !strings.Contains(vowels, string(nextPrefix)) {
				sliceOfSentences[i] = "A"
			}
		}
	}
	return strings.Join(sliceOfSentences, " ")
}
