package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"index/suffixarray"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	searchers := loadSearchers()

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	http.HandleFunc("/search", handleSearch(searchers))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("Listening on port %s...", port)
	err := http.ListenAndServe(fmt.Sprintf(":%s", port), nil)
	if err != nil {
		log.Fatal(err)
	}
}

type WorkData struct {
	FileName string
	Title string
	Type string
}

type Searcher struct {
	FileName string
	SuffixArray   *suffixarray.Index
	Title string
	Type string
	Work string
}

type SearchResult struct {
	Results []string
	Title string
	Type string
}

var worksData = [...]WorkData{
	WorkData{"1_sonnets", "Sonnets", "poem"},
	WorkData{"alls_well_that_ends_well", "All's Well That Ends Well", "play"},
	WorkData{"antony_and_cleopatra", "Antony and Cleopatra", "play"},
	WorkData{"as_you_like_it", "As You Like It", "play"},
	WorkData{"comedy_of_errors", "Comedy of Errors", "play"},
	WorkData{"coriolanus", "Coriolanus", "play"},
	WorkData{"cymbeline", "Cymbeline", "play"},
	WorkData{"hamlet", "Hamlet", "play"},
	WorkData{"henry_the_eight", "Henry the Eight", "play"},
	WorkData{"henry_the_fifth", "Henry the Fifth", "play"},
	WorkData{"henry_the_sixth", "Henry the Sixth", "play"},
	WorkData{"julius_caesar", "Julius Caesar", "play"},
	WorkData{"king_john", "King John", "play"},
	WorkData{"king_lear", "King Lear", "play"},
	WorkData{"lovers_complaint", "A Lover's Complaint", "poem"},
	WorkData{"loves_labours_lost", "Love's Labour's Lost", "play"},
	WorkData{"lucrece", "Lucrece", "play"},
	WorkData{"macbeth", "Macbeth", "play"},
	WorkData{"measure_for_measure", "Measure for Measure", "play"},
	WorkData{"merchant_of_venice", "The Merchant of Venice", "play"},
	WorkData{"merry_wives_of_windsor", "The Merry Wives of Windsor", "play"},
	WorkData{"midsummer_nights_dream", "A Midsummer's Night Dream", "play"},
	WorkData{"much_ado_about_nothing", "Much Ado About Nothing", "play"},
	WorkData{"othello", "Othello", "play"},
	WorkData{"pericles", "Pericles", "play"},
	WorkData{"phoenix_and_turtle", "The Phoenix and the Turtle", "poem"},
	WorkData{"richard_ii", "King Richard The Second", "play"},
	WorkData{"richard_iii", "King Richard The Third", "play"},
	WorkData{"romeo_and_juliet", "Romeo and Juliet", "play"},
	WorkData{"taming_of_the_shrew", "The Taming of the Shrew", "play"},
	WorkData{"tempest", "The Tempest", "play"},
	WorkData{"timon_of_athens", "Timon of Athens", "play"},
	WorkData{"titus_andronicus", "Titus Andronicus", "play"},
	WorkData{"troilus_and_cressida", "Troilus and Cressida", "play"},
	WorkData{"twelfth_night", "Twelfth Night", "play"},
	WorkData{"two_gentlemen_of_verona", "The Two Gentlemen of Verona", "play"},
	WorkData{"venus_and_adonis", "Venus and Adonis", "play"},
	WorkData{"winters_tale", "A Winter's Tale", "play"},
}

func loadSearchers() []Searcher {
	searchers := []Searcher{}

	for _, workData := range worksData {
		fullFileName := fmt.Sprintf("complete_works/%s.txt", workData.FileName)
		s := Searcher{}
		s.FileName = workData.FileName
		s.Title = workData.Title
		s.Type = workData.Type

		err := s.Load(fullFileName)
		if err != nil {
			log.Fatal(err)
		} else {
			searchers = append(searchers, s)
		}		
	}

	return searchers
}

func handleSearch(searchers []Searcher) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		query, ok := r.URL.Query()["q"]
		if !ok || len(query[0]) < 1 {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("missing search query in URL params"))
			return
		}
		lowercaseQuery := strings.ToLower(query[0])

		results := []SearchResult{}
		
		for _, s := range searchers {
			s.Search(lowercaseQuery)
			quotes := s.Search(lowercaseQuery)

			if len(quotes) > 0 {
				res := SearchResult{quotes, s.Title, s.Type}
				results = append(results, res)
			}
		}
		
		buf := &bytes.Buffer{}
		enc := json.NewEncoder(buf)
		err := enc.Encode(results)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("encoding failure"))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf.Bytes())
	}
}

func (s *Searcher) Load(filename string) error {
	dat, err := ioutil.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("Load: %w", err)
	}

	// Leaving the work with original capitalization
	// while lowercasing the suffix array
	// for case insensitive lookup while returning the original
	s.Work = string(dat)

	s.SuffixArray = suffixarray.New(bytes.ToLower(dat))
	return nil
}

func (s *Searcher) Search(query string) []string {
	idxs := s.SuffixArray.Lookup([]byte(query), -1)
	quotes := []string{}
	for _, idx := range idxs {
		begin := maxOf(idx-200, 0)
		end := minOf(idx+300, len(s.Work))
		quotes = append(quotes, s.Work[begin:end])
	}
	return quotes
}

func maxOf(left, right int) int {
	if left < right {
		return right
	}
	return left
}

func minOf(left, right int) int {
	if left > right {
		return right
	}
	return left
}
