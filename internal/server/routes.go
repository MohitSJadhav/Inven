package server

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func Router() {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Use()

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("VM Inventory Manager API server running\n"))
	})

	// Route for getting backend token
	r.Get("/api/v1/gettoken", CreateBackendToken)

	// Routes for UI and API interaction with VM APIs
	r.Get("/api/v1/inventory/vm/search", GetVmFromInventory)
	r.Get("/api/v1/inventory/vm/lookup", GetVmDataFromInventory)
	r.Put("/api/v1/inventory/vm/update", UpdateVmInInventory)
	r.Post("/api/v1/inventory/vm/create", AddVmToInventory)
	r.Delete("/api/v1/inventory/vm/remove", RemoveVmFromInventory)

	// Routes for UI and API interaction with VM APIs
	r.Get("/api/v1/inventory/vulnerability/search", GetVulnerabilityFromInventory)
	r.Put("/api/v1/inventory/vulnerability/update", UpdateVulnerability)
	r.Post("/api/v1/inventory/vulnerability/create", AddVulnerability)
	r.Delete("/api/v1/inventory/vulnerability/remove", RemoveVulnerabilityFromInventory)

	// Routes for UI and API interaction with NetworkConfig APIs
	r.Get("/api/v1/inventory/networkconfig/search", GetNetConfigFromInventory)
	r.Put("/api/v1/inventory/networkconfig/update", UpdateNetConfig)
	r.Post("/api/v1/inventory/networkconfig/create", AddNetworkConfig)
	r.Delete("/api/v1/inventory/networkconfig/remove", RemoveNetworkConfigFromInventory)

	// Routes for UI and API interaction with CPU APIs
	r.Get("/api/v1/inventory/cpudiskmem/search", GetCpuDiskMem)
	r.Post("/api/v1/inventory/cpudiskmem/create", AddCpuDiskMemConfig)
	r.Put("/api/v1/inventory/cpudiskmem/update", UpdateCpuConfig)
	r.Delete("/api/v1/inventory/cpudiskmem/remove", RemoveCpuConfig)

	// Routes for UI and API interaction with Package APIs
	r.Get("/api/v1/inventory/package/search", GetPackage)
	r.Post("/api/v1/inventory/package/create", AddPackage)
	r.Put("/api/v1/inventory/package/update", UpdatePackage)
	r.Delete("/api/v1/inventory/package/remove", RemovePackage)

	// Routes for UI and API interaction with User APIs
	r.Get("/api/v1/inventory/user/search", GetUser)
	r.Post("/api/v1/inventory/user/create", AddUser)
	r.Put("/api/v1/inventory/user/update", UpdateUser)
	r.Delete("/api/v1/inventory/user/remove", RemoveUser)

	r.Get("/service/status", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("VM Inventory Tool running\n"))
	})

	// Start server
	log.Println("starting server...")
	if err := http.ListenAndServe(":8081", r); err != nil {
		log.Println(err.Error())
	}
}
