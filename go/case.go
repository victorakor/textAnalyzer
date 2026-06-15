package app

import (
	"strconv"
	"strings"
)

// helper functions-----------------------------

func cap(s string) string {
	return strings.ToUpper(string(s[0])) + strings.ToLower(s[1:])
}

func upper(s string) string {
	return strings.ToUpper(s)
}

func lower(s string) string {
	return strings.ToLower(s)
}

//----------------------------------------------

func Cases(str string) string {
	sliceOfSentences := strings.Fields(str)

	for i := 0; i < len(sliceOfSentences); i++ {
		// ensures command is not the first index
		if i > 0 {
			newword := strings.TrimPrefix(sliceOfSentences[i], "(")
			newword = strings.TrimSuffix(newword, ")")
			words := strings.Split(newword, ",")

			if len(words) == 1 {
				switch words[0] {
				case "up":
					sliceOfSentences[i-1] = upper(sliceOfSentences[i-1])
					sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
					i--
				case "low":
					sliceOfSentences[i-1] = lower(sliceOfSentences[i-1])
					sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
					i--
				case "cap":
					sliceOfSentences[i-1] = cap(sliceOfSentences[i-1])
					sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
					i--
				}
			}

			// compound commands
			if len(words) == 2 {
				num, _ := strconv.Atoi(words[1])

				switch words[0] {
				case "up":
					for j := i - num; j < i; j++ {
						sliceOfSentences[j] = upper(sliceOfSentences[j])
					}
					sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
					i--
				case "low":
					for j := i - num; j < i; j++ {
						sliceOfSentences[j] = lower(sliceOfSentences[j])
					}
					sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
					i--
				case "cap":
					for j := i - num; j < i; j++ {
						sliceOfSentences[j] = cap(sliceOfSentences[j])
					}
					sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
					i--
				}
			}
		}
	}

	return strings.Join(sliceOfSentences, " ")
}
