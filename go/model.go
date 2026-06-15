package app

import "text/template"

type FormatRequest struct {
	Text       string `json:"text"`
	AutoFormat string `json:"autoFormat"`
}

type FormatResponse struct {
	Result string `json:"result"`
}

var Tmpl *template.Template
