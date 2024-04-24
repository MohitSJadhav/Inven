package server

import (
	"encoding/json"
	"inventory-manager/model"
	"inventory-manager/utils"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func CreateBackendToken(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var tokenRequest model.TokenRequest
	var tokenResponse model.TokenResponse
	err := json.NewDecoder(r.Body).Decode(&tokenRequest)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		tokenResponse.Token = ""
		json.NewEncoder(w).Encode(tokenResponse)
		return
	}
	if tokenRequest.Username == "" || tokenRequest.Team == "" {
		w.WriteHeader(http.StatusInternalServerError)
		tokenResponse.Token = ""
		json.NewEncoder(w).Encode(tokenResponse)
		return
	}

	claim := jwt.MapClaims{
		"tokenId":    uuid.NewString(),
		"userId":     tokenRequest.Username,
		"teamName":   tokenRequest.Team,
		"expiryTime": time.Now().Add(time.Minute * 5).Unix(),
		"createdAt":  time.Now(),
	}
	tokenJWT := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	token, err := tokenJWT.SignedString([]byte(utils.Key))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		tokenResponse.Token = ""
		json.NewEncoder(w).Encode(tokenResponse)
		return
	}
	w.WriteHeader(http.StatusOK)
	tokenResponse.Token = token
	json.NewEncoder(w).Encode(tokenResponse)
}
