package main

import (
	"inventory-manager/internal/database"
	"inventory-manager/internal/server"
)

func main() {

	// TODO: configure logger

	database.SetDbConnection()
	defer database.CloseDBConnection()

	server.Router()
}
