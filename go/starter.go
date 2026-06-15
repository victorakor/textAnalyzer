package app

import "text/template"

func init() {
	var err error
	Tmpl, err = template.New("").ParseGlob("static/*.html")
	if err != nil {
		panic(err) // or log.Fatal in main
	}
}
