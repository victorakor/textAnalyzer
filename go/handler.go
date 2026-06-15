package app

import (
	"encoding/json"
	"net/http"
)

func HandlerHome(w http.ResponseWriter, r *http.Request) {
	if err := Tmpl.ExecuteTemplate(w, "index.html", nil); err != nil {
		http.Error(w, "could not render page", http.StatusInternalServerError)
	}
}

func HandlerFormat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req FormatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	result := ResultGenerator(req.Text, req.AutoFormat)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(FormatResponse{Result: result})
}
