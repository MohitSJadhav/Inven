package database

import (
	"database/sql"
	"inventory-manager/internal/config"
	"log"
	"time"

	"github.com/go-sql-driver/mysql"
)

var DB *sql.DB

const (
	maxRetries   = 5
	retryTimeOut = 5 * time.Second
)

// TODO: set connection paramater, database name(mysql) and env vars through config
func dBConnectionObject() mysql.Config {
	cfg := mysql.Config{
		User:   config.DATABASE_USER,
		Passwd: config.DATABASE_PASSWORD,
		Net:    config.DATABASE_NET,
		Addr:   config.DATABASE_ADDRESS,
		DBName: config.DATABASE_NAME,
	}
	return cfg
}

func SetDbConnection() {

	// Get a database connection handler.
	var err error
	cfg := dBConnectionObject()
	DB, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	DB.SetConnMaxLifetime(time.Hour * 5)
	DB.SetConnMaxIdleTime(time.Second * 30)
	DB.SetMaxIdleConns(5)
	DB.SetMaxOpenConns(20)

	for attempt := 0; attempt < maxRetries; attempt++ {
		pingErr := DB.Ping()
		if pingErr != nil {
			log.Println("error while connecting!")
			log.Fatal(pingErr.Error())
		}
	}
	log.Println("connected to DB!")

}

func GetDBConnection() *sql.DB {
	return DB
}

func CloseDBConnection() error {
	err := DB.Close()
	if err != nil {
		log.Println("database connection closing error")
		return err
	}
	log.Println("database connection closed!")
	return nil
}
