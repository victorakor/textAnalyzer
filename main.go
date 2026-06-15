package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	app "textanalyzer/go"
)

func main() {

	// parsing css and js to golang
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("static/css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("static/js"))))

	http.HandleFunc("/", app.HandlerHome)
	http.HandleFunc("/format", app.HandlerFormat)

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	} else if port[0] != ':' {
		port = ":" + port
	}

	fmt.Println("listening on port", port)

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}
