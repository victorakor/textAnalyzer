package app

import (
	"strconv"
	"strings"
)

func BaseConverter(s string) string {
	sliceOfSentences := strings.Fields(s)
	for i := 0; i < len(sliceOfSentences); i++ {
		switch sliceOfSentences[i] {
		case "(bin)":
			converted, _ := strconv.ParseInt(sliceOfSentences[i-1], 2, 64)
			sliceOfSentences[i-1] = strconv.Itoa(int(converted))
			sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
			i--
		case "(hex)":
			converted, _ := strconv.ParseInt(sliceOfSentences[i-1], 16, 64)
			sliceOfSentences[i-1] = strconv.Itoa(int(converted))
			sliceOfSentences = append(sliceOfSentences[:i], sliceOfSentences[i+1:]...)
			i--
		}
	}
	return strings.Join(sliceOfSentences, " ")
}
