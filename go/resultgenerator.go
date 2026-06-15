package app

import "strings"

func ResultGenerator(text string, autoFormat string) string {
	// Always resolve tag syntax first
	result := Processor(text)
	result = BaseConverter(result)
	result = Cases(result)
	result = FixArticle(result)
	result = Punctuation(result)

	switch autoFormat {
	case "off":
		return result
	case "standard":
		return standard(result)
	case "title":
		lines := strings.Split(result, "\n")
		if len(lines) > 0 {
			lines[0] = titleCase(lines[0])
		}
		for i := 1; i < len(lines); i++ {
			lines[i] = standard(lines[i])
		}
		return strings.Join(lines, "\n")
	case "condensed":
		words := strings.Fields(result)
		return strings.Join(words, " ")
	}
	return result
}
