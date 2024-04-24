package server

import (
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
)

func authRequest(w http.ResponseWriter, r *http.Request) {

}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if !strings.HasPrefix(tokenString, "Bearer ") {

		}
		tokenString = tokenString[len("Bearer "):]
		if tokenString == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			log.Println("Validating token")

			log.Println("validated token!")
			return token, nil
		})

		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		// Token is valid, call the next handler
		next(w, r)
	}
}

func extractTokenFromHeader(authHeader string) string {
	parts := strings.Split(authHeader, " ")
	if len(parts) == 2 {
		return parts[1]
	}
	return ""
}
