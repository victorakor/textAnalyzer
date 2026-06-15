package app

import "strings"

// this fuction removes all spaces existing in compound commands
func Processor(str string) string {
	inBracket := false
	var newStr strings.Builder

	for _, val := range str {
		if val == '(' && inBracket == false {
			inBracket = true
		}
		if inBracket == true && val == ' ' {
			continue
		}
		if inBracket == true && val == ')' {
			inBracket = false
		}
		newStr.WriteString(string(val))
	}
	return newStr.String()
}
