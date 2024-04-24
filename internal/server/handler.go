package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"inventory-manager/internal/database"
	"inventory-manager/model"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

func GetVmFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := model.HostResponse{
		StatusCode: http.StatusInternalServerError, // TODO: self declared error codes for server and api communication
		Error:      "internal server error. please try again",
		Message:    "server experienced issues while executing the query on table",
		Data:       []model.Host{},
	}

	// hostname := chi.URLParam(r, "hostname")
	hostname := r.URL.Query().Get("hostname")
	filterBy := r.URL.Query().Get("filter")

	query := ""
	switch {
	case filterBy == "datacenter":
		query = "SELECT * FROM inventory.server where server.datacenter=? limit 10"
	case filterBy == "ip":
		query = "SELECT * FROM inventory.server where server.ip=? limit 10"
	case filterBy == "id":
		query = "SELECT * FROM inventory.server where server.hostid=? limit 10"
	default:
		query = "SELECT * FROM inventory.server where server.hostname=? limit 10"
	}
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, hostname)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "internal server error", "failed executing query on database")
		printHostResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "internal server error", "failed executing query on database")
		printHostResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, err := ReadDbVmObj(rows)
	if len(dbObj) == 0 {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "VM not found", fmt.Sprintf("VM with search value '%s' not found", hostname))
		printHostResponse(fmt.Sprintf("either host '%s' not found or does not exist for the search VM request", err.Error()), w, &response)
		return
	}

	// Loop through rows, using Scan to assign column data to struct fields.
	var hosts []model.Host
	for i := 0; i < len(dbObj); i++ {
		hosts = append(hosts, dbObj[i].Host)
	}
	response.Data = hosts
	SetHostResponse(w, r, &response, http.StatusOK, http.StatusOK, "", "data found for search VM request")
	printHostResponse("found data for search VM request", w, &response)
}

func GetVmDataFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := model.HostData{}
	vulArray := []model.DbVulnerability{}
	packageArray := []model.Package{}
	log.Println("Executing host")
	// hostname := chi.URLParam(r, "hostname")
	hostname := r.URL.Query().Get("hostid")
	query := "SELECT * FROM inventory.server where server.hostid=? limit 10"
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, hostname)
	if err != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, err := ReadDbVmObj(rows)
	if len(dbObj) == 0 {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("either host '%s' not found or does not exist for the search VM request", err.Error()), w, &response)
		return
	}

	// Loop through rows, using Scan to assign column data to struct fields.
	var hosts []model.Host
	for i := 0; i < len(dbObj); i++ {
		hosts = append(hosts, dbObj[i].Host)
	}
	response.HostData = hosts[0]

	log.Println("Done host")
	query = "SELECT * FROM inventory.networkconfig where networkconfig.hostid=? limit 50"
	rows, err = dBConn.Query(query, hostname)
	if err != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	// var dbNetwork []model.NetworkConfig
	dbNetwork, _ := ReadNetworkConfigObj(rows)
	if len(dbNetwork) != 0 {

		// Loop through rows, using Scan to assign column data to struct fields.
		// var networkConfigArray []model.NetworkConfig
		// for i := 0; i < len(dbNetwork); i++ {
		// 	networkConfig = append(networkConfig, dbNetwork[i])
		// }
		response.NetworkData = dbNetwork[0]
	} else {
		response.NetworkData = model.NetworkConfig{}
	}

	log.Println("Done netowrk")

	// CPU

	query = "SELECT * FROM inventory.cpudiskmem where cpudiskmem.hostid=? limit 10"
	rows, err = dBConn.Query(query, hostname)
	if err != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	// var dbCpu []model.NetworkConfig
	dbCpu, _ := ReadCpuDiskMem(rows)
	if len(dbCpu) != 0 {

		// Loop through rows, using Scan to assign column data to struct fields.

		// for i := 0; i < len(dbCpu); i++ {
		// 	cpuMem = append(cpuMem, dbCpu[i])
		// }
		response.CpuDiskMemData = dbCpu[0]
		log.Println("Done cpu")
	} else {
		response.PackageData = packageArray
	}

	// PACKAGE

	query = "SELECT p.* FROM package p JOIN serverpackage sp ON p.packageid = sp.packageid WHERE sp.hostid = ?"
	rows, err = dBConn.Query(query, hostname)
	if err != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	// var dbCpu []model.NetworkConfig
	dbPackage, err := ReadPackage(rows)
	if len(dbPackage) != 0 {

		// Loop through rows, using Scan to assign column data to struct fields.
		// var packagearray []model.Package
		// for i := 0; i < len(dbPackage); i++ {
		// 	packageArray = append(packageArray, dbPackage[i])
		// }
		response.PackageData = dbPackage

	} else {
		response.PackageData = packageArray
	}
	log.Println("Done package")
	// Vulnerability

	query = "select v.* from vulnerability v join servervulnerability sv ON v.vulnerabilityid = sv.vulnerabilityid where sv.hostid=?"
	rows, err = dBConn.Query(query, hostname)
	if err != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetHostDataResponse(w, r, http.StatusInternalServerError)
		printHostDataResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	// var dbCpu []model.NetworkConfig
	dbVul, err := ReadDbVulObj(rows)
	if len(dbVul) != 0 {

		// Loop through rows, using Scan to assign column data to struct fields.
		// var vularray []model.Vulnerability
		// for i := 0; i < len(dbVul); i++ {
		// 	vulArray = append(vulArray, dbVul[i])
		// }
		response.VulnerabilityData = dbVul
	} else {
		response.VulnerabilityData = vulArray
	}

	log.Println("Done vul")
	SetHostDataResponse(w, r, http.StatusOK)
	printHostDataResponse("found data for search VM request", w, &response)

}

// TODO
func UpdateVmInInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := model.HostResponse{
		StatusCode: http.StatusInternalServerError, // TODO: self declared error codes for server and api communication
		Error:      "internal server error. please try again",
		Message:    "server experienced issues while executing the query on table",
		Data:       []model.Host{},
	}

	// Read the request body
	var requestServerData model.Host
	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "unable to read the request. try again", "failed decoding the request body/invalid request body")
		printHostResponse(fmt.Sprintf("decoding json request-body failed for update VM request. error: '%s'", err.Error()), w, &response)
		return
	}

	// Check whether hostname is empty
	if requestServerData.HostId == "" {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "empty VM ID found or invalid ID in request", fmt.Sprintf("VM ID not found. ID: '%s'", requestServerData.HostId))
		printHostResponse("decoding json request-body failed for update VM request. VM Id not found", w, &response)
		return
	}

	// check if host is present already in DB
	status, obj, err := checkAndGetHostIfItExists(requestServerData.HostId, "id")
	if !status {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "host/VM not present. add it to the inventory", fmt.Sprintf("host '%s' does not exists", requestServerData.Hostname))
		printHostResponse(fmt.Sprintf("host '%s' does not exists in table for update request. error: %s", requestServerData.Hostname, err.Error()), w, &response)
		return
	}
	// Modify database entry/data based on user input
	obj = CheckModifyDbObj(obj, requestServerData)

	// Save data into DB
	dBConn := database.GetDBConnection()
	query, err := dBConn.Prepare("UPDATE inventory.server set server.hostname=?, server.region=?, server.datacenter=?, server.environment=?, server.owners=?, server.os=?, server.ip=?,server.status=?, server.updatedat=? where server.hostid=?")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "internal error occured while updating data. try again", "internal error occured while updating data")
		printHostResponse(err.Error(), w, &response)
		return
	}
	result, err := query.Exec(obj.Host.Hostname, obj.Host.Region, obj.Host.DataCenter, obj.Host.Environment, obj.Host.Owners, obj.Host.OS, obj.Host.Ip, obj.Host.Status, time.Now().UTC(), obj.Host.HostId)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "internal error occured while updating data. try again", "internal error occured while updating data")
		printHostResponse("error occured while executing the database query. error: "+err.Error(), w, &response)
		return
	}
	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "internal error occured while updating data. try again", "internal error occured while updating data")
		printHostResponse(err.Error(), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "internal error occured while updating data. try again", fmt.Sprintf("no rows affected by insertion for %s\n", requestServerData.Hostname))
		printHostResponse("", w, &response)
		return
	}
	SetHostResponse(w, r, &response, http.StatusOK, http.StatusOK, "updated VM data", fmt.Sprintf("updated VM data with VM ID: '%s'", requestServerData.HostId))
	printHostResponse(fmt.Sprintf("update data for VM with id '%s'", requestServerData.HostId), w, &response)
}

// DONE
func AddVmToInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// default response object
	response := model.HostResponse{
		StatusCode: http.StatusInternalServerError, // TODO: self declared error codes for server and api communication
		Error:      "internal server error. please try again",
		Message:    "server experienced issues while executing the query on table",
		Data:       []model.Host{},
	}

	var requestServerData model.Host
	dBConn := database.GetDBConnection()

	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "unable to read the request. try again", "failed decoding the request body/invalid request body")
		printHostResponse(("decoding json request body failed : " + err.Error()), w, &response)
		return
	}
	if requestServerData.Hostname == "" {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "missing VM/hostname. try again", fmt.Sprintf("missing hostname/Vm. found: '%s'", requestServerData.Hostname))
		printHostResponse(("missing VM/hostname for add VM request"), w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkAndGetHostIfItExists(requestServerData.Hostname, "hostname")
	if status {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, fmt.Sprintf("host/VM with name '%s' already present", requestServerData.Hostname), fmt.Sprintf("host/VM with name '%s' already present", requestServerData.Hostname))
		printHostResponse(fmt.Sprintf("host/VM with name '%s' already present", requestServerData.Hostname), w, &response)
		return
	}

	stmt, err := dBConn.Prepare("INSERT INTO inventory.server(hostid, hostname, region, datacenter, os, owners, environment, ip, status, createdat, updatedat) VALUES(?,?,?,?,?,?,?,?,?,?,?)")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request", "error occured while working with request ")
		printHostResponse(fmt.Sprintf("database prepared query error '%s' for request with host '%s'", err.Error(), requestServerData.Hostname), w, &response)
		return
	}

	result, err := stmt.Exec(uuid.New().String(), requestServerData.Hostname, requestServerData.Region, requestServerData.DataCenter, requestServerData.OS, requestServerData.Owners, requestServerData.Environment, requestServerData.Ip, requestServerData.Status, time.Now(), time.Now())
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request", "error occured while working with request ")
		printHostResponse(fmt.Sprintf("database query execution error '%s' for request with host '%s'", err.Error(), requestServerData.Hostname), w, &response)
		return
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request", "error occured working with request ")
		printHostResponse(fmt.Sprintf("database rows affected read error '%s' for request with host '%s'", err.Error(), requestServerData.Hostname), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "unable to perform request", "error occured working with request ")
		printHostResponse(fmt.Sprintf("no rows affected for request with host '%s'", requestServerData.Hostname), w, &response)

		return
	}
	w.WriteHeader(http.StatusOK)
	SetHostResponse(w, r, &response, http.StatusOK, http.StatusOK, "sucessfully added VM", "sucessfully added VM")
	printHostResponse(fmt.Sprintf("added Vm/Host '%s'", requestServerData.Hostname), w, &response)
}

// TODO
func RemoveVmFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := model.HostResponse{
		StatusCode: http.StatusInternalServerError, // TODO: self declared error codes for server and api communication
		Error:      "internal server error. please try again",
		Message:    "server experienced issues while executing the query on table",
		Data:       []model.Host{},
	}

	vmid := r.URL.Query().Get("vmid")
	log.Println("vmid: ", vmid)
	if vmid == "" {
		SetHostResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "empty VM name found", "empty VM name found")
		printHostResponse("hostname is empty for the delete request", w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkAndGetHostIfItExists(vmid, "id")
	if !status {
		SetHostResponse(w, r, &response, http.StatusNotFound, http.StatusNotFound, "VM not found in records", "VM not found in records")
		printHostResponse(fmt.Sprintf("VM not present. '%s'", vmid), w, &response)
		return
	}

	dbConn := database.GetDBConnection()

	// Server Package
	stmt, err := dbConn.Prepare("DELETE FROM inventory.serverpackage where serverpackage.hostid=?")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	result, err := stmt.Exec(vmid)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	// Server Vul

	stmt, err = dbConn.Prepare("DELETE FROM inventory.servervulnerability where servervulnerability.hostid=?")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	_, err = stmt.Exec(vmid)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	// network config

	stmt, err = dbConn.Prepare("DELETE FROM inventory.networkconfig where networkconfig.hostid=?")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	_, err = stmt.Exec(vmid)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	stmt, err = dbConn.Prepare("DELETE FROM inventory.cpudiskmem where cpudiskmem.hostid=?")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	_, err = stmt.Exec(vmid)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	stmt, err = dbConn.Prepare("DELETE FROM inventory.server where server.hostid=?")
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	result, err = stmt.Exec(vmid)
	if err != nil {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, "unable to perform request for VM", "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	if rowAffected, err := result.RowsAffected(); rowAffected == 0 {
		SetHostResponse(w, r, &response, http.StatusInternalServerError, http.StatusInternalServerError, fmt.Sprintf("unable to delete VM: '%s'", vmid), "internal server error with db")
		printHostResponse(fmt.Sprintf("error '%s' occured for VM: '%s'", err.Error(), vmid), w, &response)
		return
	}

	SetHostResponse(w, r, &response, http.StatusOK, http.StatusOK, fmt.Sprintf("deleted VM: '%s' ", vmid), "deleted VM sucessfully")
	printHostResponse(fmt.Sprintf("deleted VM: '%s'", vmid), w, &response)
}

func checkAndGetHostIfItExists(hostname string, param string) (bool, model.DbObj, error) {

	dBConn := database.GetDBConnection()
	var obj model.DbObj
	prepareStatement := "SELECT * FROM inventory.server WHERE server.hostname=?"
	if param == "id" {
		prepareStatement = "SELECT * FROM inventory.server WHERE server.hostid=?"
	}
	stmt, err := dBConn.Prepare(prepareStatement)
	if err != nil {
		log.Println(err.Error())
		return false, obj, err
	}

	row := stmt.QueryRow(hostname)
	err = row.Scan(&obj.Host.Hostname, &obj.Host.HostId, &obj.Host.OS, &obj.Host.Owners, &obj.Host.DataCenter, &obj.Host.Environment, &obj.Host.Ip, &obj.Host.Region, &obj.Created_at, &obj.Updated_at, &obj.Host.Status)
	if err != nil {
		return false, obj, err
	}
	if obj.Host.HostId == "" {
		return false, obj, errors.New("")
	}
	return true, obj, errors.New("")
}

func checkAndGetVulIfItExists(vulnerability_id string, param string) (bool, model.DbVulnerability, error) {

	dBConn := database.GetDBConnection()
	var obj model.DbVulnerability
	prepareStatement := "SELECT * FROM inventory.vulnerability WHERE vulnerability.vulnerabilityid=?"
	if param == "vulnerabilityname" {
		prepareStatement = "SELECT * FROM inventory.vulnerability WHERE vulnerability.vulnerabilityname=?"
	}
	stmt, err := dBConn.Prepare(prepareStatement)
	if err != nil {
		log.Println(err.Error())
		return false, obj, err
	}

	row := stmt.QueryRow(vulnerability_id)
	err = row.Scan(&obj.VulnerabilityId, &obj.Description, &obj.VulnerabilityName, &obj.DetectionDate, &obj.Severity, &obj.Status)
	log.Println(obj.VulnerabilityId)
	log.Println(obj.VulnerabilityName)
	log.Println(obj.Description)
	log.Println(obj.DetectionDate)
	log.Println(obj.Severity)
	log.Println(obj.Status)
	if err != nil {
		return false, obj, err
	}
	if obj.VulnerabilityId == "" {
		return false, obj, errors.New("")
	}
	return true, obj, errors.New("")
}

func checkAndGetNetConfigIfItExists(hostid string, param string) (bool, model.NetworkConfig, error) {

	dBConn := database.GetDBConnection()
	var obj model.NetworkConfig
	prepareStatement := "SELECT * FROM inventory.networkconfig WHERE networkconfig.hostid=?"

	stmt, err := dBConn.Prepare(prepareStatement)
	if err != nil {
		log.Println(err.Error())
		return false, obj, err
	}

	row := stmt.QueryRow(hostid)
	err = row.Scan(&obj.HostId, &obj.MacAddr, &obj.Ports, &obj.SubnetMask, &obj.DnsServer, &obj.UpdateDate, &obj.Gateway)
	if err != nil {
		return false, obj, err
	}
	if obj.HostId == "" {
		return false, obj, errors.New("")
	}
	return true, obj, errors.New("")
}
func checkAndGetCpuHostIfItExists(hostid string, param string) (bool, model.CpuDiskMem, error) {

	dBConn := database.GetDBConnection()
	var obj model.CpuDiskMem
	prepareStatement := "SELECT * FROM inventory.cpudiskmem WHERE cpudiskmem.hostid=?"

	stmt, err := dBConn.Prepare(prepareStatement)
	if err != nil {
		log.Println(err.Error())
		return false, obj, err
	}

	row := stmt.QueryRow(hostid)
	err = row.Scan(&obj.HostID, &obj.DiskType, &obj.DiskSize, &obj.NumOfCores, &obj.TotalMemory, &obj.Updated_at)
	if err != nil {
		return false, obj, err
	}
	if obj.HostID == "" {
		return false, obj, errors.New("")
	}
	return true, obj, errors.New("")
}

func checkAndGetPackageIfItExists(hostid string, param string) (bool, model.Package, error) {

	dBConn := database.GetDBConnection()
	var obj model.Package
	prepareStatement := "SELECT * FROM inventory.package WHERE package.packageid=?"
	if param == "packagename" {
		prepareStatement = "SELECT * FROM inventory.package WHERE package.packagename=?"
	}
	stmt, err := dBConn.Prepare(prepareStatement)
	if err != nil {
		log.Println(err.Error())
		return false, obj, err
	}

	row := stmt.QueryRow(hostid)
	err = row.Scan(&obj.PackageId, &obj.PackageName, &obj.Permission, &obj.UpdateDate, &obj.Version)
	if err != nil {
		return false, obj, err
	}
	if obj.PackageId == "" {
		return false, obj, errors.New("")
	}
	return true, obj, errors.New("")
}

func checkUser(hostid string, param string) (bool, model.User, error) {

	dBConn := database.GetDBConnection()
	var obj model.User
	prepareStatement := "SELECT * FROM inventory.user WHERE user.email=?"
	if param == "username" {
		prepareStatement = "SELECT * FROM inventory.user WHERE user.username=?"
	}
	stmt, err := dBConn.Prepare(prepareStatement)
	if err != nil {
		log.Println(err.Error())
		return false, obj, err
	}

	row := stmt.QueryRow(hostid)
	err = row.Scan(&obj.UserName, &obj.Email, &obj.Password, &obj.GroupName, &obj.Updatedate, &obj.Status)
	if err != nil {
		return false, obj, err
	}
	if obj.Email == "" {
		return false, obj, errors.New("")
	}
	return true, obj, errors.New("")
}

func printHostResponse(err string, w http.ResponseWriter, response *model.HostResponse) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}

func printHostDataResponse(err string, w http.ResponseWriter, response *model.HostData) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}
func printVulResponse(err string, w http.ResponseWriter, response *[]model.DbVulnerability) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}
func printNetConfigResponse(err string, w http.ResponseWriter, response *[]model.NetworkConfig) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}
func printCpuDiskMemResponse(err string, w http.ResponseWriter, response *[]model.CpuDiskMem) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}

func printPackageResponse(err string, w http.ResponseWriter, response *[]model.Package) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}
func printUserResponse(err string, w http.ResponseWriter, response *[]model.User) {
	log.Println(err)
	json.NewEncoder(w).Encode(response)
}

func GetVulnerabilityFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := []model.DbVulnerability{}

	parameter := r.URL.Query().Get("parameter")
	filterBy := r.URL.Query().Get("filter")

	query := ""
	switch {
	case filterBy == "vulnerabilityname":
		query = "SELECT * FROM inventory.vulnerability where vulnerability.vulnerabilityname=? limit 50"
	case filterBy == "status":
		query = "SELECT * FROM inventory.vulnerability where vulnerability.status=? limit 50"
	case filterBy == "severity":
		query = "SELECT * FROM inventory.vulnerability where vulnerability.severity=? limit 50"
	default:
		query = "SELECT * FROM inventory.vulnerability where vulnerability.vulnerabilityid=? limit 50"
	}
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, parameter)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		w.WriteHeader(http.StatusInternalServerError)
		printVulResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, err := ReadDbVulObj(rows)
	if len(dbObj) == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("either vulnerability %s not found or does not exist for the search Vulnerability request", err.Error()), w, &response)
		return
	}

	// Loop through rows, using Scan to assign column data to struct fields.
	var hosts []model.DbVulnerability
	for i := 0; i < len(dbObj); i++ {
		hosts = append(hosts, dbObj[i])
	}
	vulResponse := hosts
	SetVulResponse(w, r, http.StatusOK)
	log.Println(err)
	json.NewEncoder(w).Encode(vulResponse)

}

func RemoveVulnerabilityFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.DbVulnerability{}

	vulnerabilityid := r.URL.Query().Get("vulnerabilityid")
	log.Println("vulnerabilityid: ", vulnerabilityid)
	if vulnerabilityid == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse("vulnerability id field is empty for the delete request", w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkAndGetVulIfItExists(vulnerabilityid, "vulnerabilityid")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("vulnerability not present. '%s'", vulnerabilityid), w, &response)
		return
	}

	dbConn := database.GetDBConnection()

	stmt, err := dbConn.Prepare("DELETE FROM inventory.vulnerability where vulnerability.vulnerabilityid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("error '%s' occured for vulnerability: '%s'", err.Error(), vulnerabilityid), w, &response)
		return
	}

	result, err := stmt.Exec(vulnerabilityid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("error '%s' occured for vulnerability: '%s'", err.Error(), vulnerabilityid), w, &response)
		return
	}

	if rowAffected, err := result.RowsAffected(); rowAffected == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("error '%s' occured for vulnerability: '%s'", err.Error(), vulnerabilityid), w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printVulResponse(fmt.Sprintf("Deleted Vulnerability: '%s'", vulnerabilityid), w, &response)
}

func AddVulnerability(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// default response object
	response := []model.DbVulnerability{}

	var requestServerData model.DbVulnerability
	dBConn := database.GetDBConnection()

	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(("decoding json request body failed : " + err.Error()), w, &response)
		return
	}
	if requestServerData.VulnerabilityName == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(("missing vulnerability name for add vulnerability request"), w, &response)
		return
	}

	// check if vul is present already in DB
	status, _, _ := checkAndGetVulIfItExists(strings.ToLower(requestServerData.VulnerabilityName), "vulnerabilityname")
	if status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("Vulnerability with name '%s' already present", strings.ToLower(requestServerData.VulnerabilityName)), w, &response)
		return
	}

	stmt, err := dBConn.Prepare("INSERT INTO inventory.vulnerability(vulnerabilityid, description, vulnerabilityname, detectiondate, severity, status) VALUES(?,?,?,?,?,?)")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse(fmt.Sprintf("database prepared query error '%s' for request with vulnerability '%s'", err.Error(), requestServerData.VulnerabilityName), w, &response)
		return
	}

	result, err := stmt.Exec(uuid.NewString(), strings.ToLower(requestServerData.Description), strings.ToLower(requestServerData.VulnerabilityName), requestServerData.DetectionDate, strings.ToLower(requestServerData.Severity), strings.ToLower(requestServerData.Status))
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse(fmt.Sprintf("database query execution error '%s' for request with vulnerability id '%s'", err.Error(), requestServerData.VulnerabilityName), w, &response)
		return
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse(fmt.Sprintf("database rows affected read error '%s' for request with vulnerability id '%s'", err.Error(), requestServerData.VulnerabilityId), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse(fmt.Sprintf("no rows affected for request with vulnerability '%s'", requestServerData.VulnerabilityName), w, &response)

		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printVulResponse(fmt.Sprintf("added vulnerability '%s'", requestServerData.VulnerabilityName), w, &response)
}

func UpdateVulnerability(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.DbVulnerability{}

	// Read the request body
	var requestServerData model.DbVulnerability
	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("decoding json request-body failed for update Vulnerability request. error: '%s'", err.Error()), w, &response)
		return
	}

	// Check whether hostname is empty
	if requestServerData.VulnerabilityName == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse("decoding json request-body failed for update Vulnerability request. VM Id not found", w, &response)
		return
	}

	// check if host is present already in DB
	status, obj, err := checkAndGetVulIfItExists(requestServerData.VulnerabilityId, "id")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printVulResponse(fmt.Sprintf("Vulnerability '%s' does not exists in table for update request. error: %s", requestServerData.VulnerabilityName, err.Error()), w, &response)
		return
	}

	// Save data into DB
	dBConn := database.GetDBConnection()
	query, err := dBConn.Prepare("UPDATE inventory.vulnerability set vulnerability.vulnerabilityname=?, vulnerability.description=?, vulnerability.detectiondate=?, vulnerability.severity=?, vulnerability.status=? where vulnerability.vulnerabilityid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse(err.Error(), w, &response)
		return
	}
	obj = requestServerData
	result, err := query.Exec(obj.VulnerabilityName, obj.Description, obj.DetectionDate, obj.Severity, obj.Status, obj.VulnerabilityId)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse("error occured while executing the database query. error: "+err.Error(), w, &response)
		return
	}
	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusAlreadyReported)
		printVulResponse(err.Error(), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printVulResponse("no rows affected", w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printVulResponse(fmt.Sprintf("update data for vulnerability with id '%s'", requestServerData.VulnerabilityId), w, &response)

}

func GetNetConfigFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := []model.NetworkConfig{}

	hostid := r.URL.Query().Get("hostid")
	query := "SELECT * FROM inventory.networkconfig where networkconfig.hostid=? limit 50"
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, hostid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		w.WriteHeader(http.StatusInternalServerError)
		printNetConfigResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, err := ReadNetworkConfigObj(rows)
	if len(dbObj) == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("either vulnerability %s not found or does not exist for the search Vulnerability request", err.Error()), w, &response)
		return
	}
	// Loop through rows, using Scan to assign column data to struct fields.
	SetVulResponse(w, r, http.StatusOK)
	json.NewEncoder(w).Encode(dbObj)

}

func AddNetworkConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// default response object
	response := []model.NetworkConfig{}

	var requestServerData model.NetworkConfig
	dBConn := database.GetDBConnection()

	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(("decoding json request body failed : " + err.Error()), w, &response)
		return
	}
	if requestServerData.HostId == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(("missing hostid add request"), w, &response)
		return
	}

	// check if vul is present already in DB
	status, _, _ := checkAndGetNetConfigIfItExists(strings.ToLower(requestServerData.HostId), "hostid")
	if status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("Network Config with name '%s' already present", strings.ToLower(requestServerData.HostId)), w, &response)
		return
	}

	stmt, err := dBConn.Prepare("INSERT INTO inventory.networkconfig(hostid, macaddr, ports, subnetmask, dnsserver, updatedate, gateway) VALUES(?,?,?,?,?,?,?)")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse(fmt.Sprintf("database prepared query error '%s' for request with networkconfig '%s'", err.Error(), requestServerData.HostId), w, &response)
		return
	}

	result, err := stmt.Exec(requestServerData.HostId, requestServerData.MacAddr, requestServerData.Ports, requestServerData.SubnetMask, requestServerData.DnsServer, time.Now(), requestServerData.Gateway)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse(fmt.Sprintf("database query execution error '%s' for request with networkconfig id '%s'", err.Error(), requestServerData.HostId), w, &response)
		return
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse(fmt.Sprintf("database rows affected read error '%s' for request with networkconfig id '%s'", err.Error(), requestServerData.HostId), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse(fmt.Sprintf("no rows affected for request with networkconfig '%s'", requestServerData.HostId), w, &response)

		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printNetConfigResponse(fmt.Sprintf("added networkconfig '%s'", requestServerData.HostId), w, &response)
}

func UpdateNetConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.NetworkConfig{}

	// Read the request body
	var requestServerData model.NetworkConfig
	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("decoding json request body failed for networkConfig update request. error: '%s'", err.Error()), w, &response)
		return
	}

	// Check whether hostname is empty
	if requestServerData.HostId == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse("decoding json request-body failed for update networkConfig request. hostid not found", w, &response)
		return
	}

	// check if host is present already in DB
	status, obj, err := checkAndGetNetConfigIfItExists(requestServerData.HostId, "id")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("host with id '%s' does not exists in table for update request. error: %s", requestServerData.HostId, err.Error()), w, &response)
		return
	}

	// Save data into DB
	dBConn := database.GetDBConnection()
	query, err := dBConn.Prepare("UPDATE inventory.networkconfig set networkconfig.macaddr=?, networkconfig.ports=?, networkconfig.subnetmask=?, networkconfig.dnsserver=?, networkconfig.updatedate=?, networkconfig.gateway=? where networkconfig.hostid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse(err.Error(), w, &response)
		return
	}
	obj = requestServerData
	result, err := query.Exec(obj.MacAddr, obj.Ports, obj.SubnetMask, obj.DnsServer, time.Now(), obj.Gateway, obj.HostId)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse("error occured while executing the database query. error: "+err.Error(), w, &response)
		return
	}
	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusAlreadyReported)
		printNetConfigResponse(err.Error(), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printNetConfigResponse("no rows affected", w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printNetConfigResponse(fmt.Sprintf("updated data for networkconfig for host with id '%s'", requestServerData.HostId), w, &response)

}

func RemoveNetworkConfigFromInventory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.NetworkConfig{}

	hostid := r.URL.Query().Get("hostid")
	log.Println("hostid: ", hostid)
	if hostid == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse("hostid id field is empty for the delete request", w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkAndGetNetConfigIfItExists(hostid, "hostid")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("host with id not present. '%s'", hostid), w, &response)
		return
	}

	dbConn := database.GetDBConnection()

	stmt, err := dbConn.Prepare("DELETE FROM inventory.networkconfig where networkconfig.hostid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("error '%s' occured for networkconfig: '%s'", err.Error(), hostid), w, &response)
		return
	}

	result, err := stmt.Exec(hostid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("error '%s' occured for networkconfig: '%s'", err.Error(), hostid), w, &response)
		return
	}

	if rowAffected, err := result.RowsAffected(); rowAffected == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("error '%s' occured for networkconfig: '%s'", err.Error(), hostid), w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printNetConfigResponse(fmt.Sprintf("Deleted Network Config: '%s'", hostid), w, &response)
}

func GetCpuDiskMem(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := []model.CpuDiskMem{}

	hostid := r.URL.Query().Get("hostid")
	query := "SELECT * FROM inventory.cpudiskmem where cpudiskmem.hostid=? limit 10"
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, hostid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		w.WriteHeader(http.StatusInternalServerError)
		printCpuDiskMemResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, _ := ReadCpuDiskMem(rows)
	if len(dbObj) == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse("either cpu,disk and memory data  not found or does not exist for the search Vulnerability request", w, &response)
		return
	}
	// Loop through rows, using Scan to assign column data to struct fields.
	SetVulResponse(w, r, http.StatusOK)
	json.NewEncoder(w).Encode(dbObj)

}

func AddCpuDiskMemConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// default response object
	response := []model.CpuDiskMem{}

	var requestServerData model.CpuDiskMem
	dBConn := database.GetDBConnection()

	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse(("decoding json request body failed : " + err.Error()), w, &response)
		return
	}
	if requestServerData.HostID == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse(("missing hostid add request"), w, &response)
		return
	}

	// check if vul is present already in DB
	status, _, _ := checkAndGetCpuHostIfItExists(strings.ToLower(requestServerData.HostID), "HostID")
	if status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse(fmt.Sprintf("Host with id '%s' already present", strings.ToLower(requestServerData.HostID)), w, &response)
		return
	}

	stmt, err := dBConn.Prepare("INSERT INTO inventory.cpudiskmem (hostid, disktype, size, numofcores, totalmemory, updated_at) VALUES(?,?,?,?,?,?)")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse(fmt.Sprintf("database prepared query error '%s' for request with cpu, disk and mem '%s'", err.Error(), requestServerData.HostID), w, &response)
		return
	}

	result, err := stmt.Exec(requestServerData.HostID, requestServerData.DiskType, requestServerData.DiskSize, requestServerData.NumOfCores, requestServerData.TotalMemory, time.Now())
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse(fmt.Sprintf("database query execution error '%s' for request with host id '%s'", err.Error(), requestServerData.HostID), w, &response)
		return
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse(fmt.Sprintf("database rows affected read error '%s' for request with host id '%s'", err.Error(), requestServerData.HostID), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse(fmt.Sprintf("no rows affected for request with cpu, disk and mem '%s'", requestServerData.HostID), w, &response)

		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printCpuDiskMemResponse(fmt.Sprintf("added cpu, disk and mem for hostid '%s'", requestServerData.HostID), w, &response)
}

func UpdateCpuConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.CpuDiskMem{}

	// Read the request body
	var requestServerData model.CpuDiskMem
	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse(fmt.Sprintf("decoding json request body failed for cpu, disk, memory update request. error: '%s'", err.Error()), w, &response)
		return
	}

	// Check whether hostname is empty
	if requestServerData.HostID == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse("decoding json request-body failed for update cpu, disk, and memory request. hostid not found", w, &response)
		return
	}

	// check if host is present already in DB
	status, obj, err := checkAndGetCpuHostIfItExists(requestServerData.HostID, "id")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printCpuDiskMemResponse(fmt.Sprintf("host with id '%s' does not exists in table for update request. error: %s", requestServerData.HostID, err.Error()), w, &response)
		return
	}

	// Save data into DB
	dBConn := database.GetDBConnection()
	query, err := dBConn.Prepare("UPDATE inventory.cpudiskmem set cpudiskmem.disktype=?, cpudiskmem.size=?, cpudiskmem.numofcores=?, cpudiskmem.totalmemory=?, cpudiskmem.updated_at=? where cpudiskmem.hostid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse(err.Error(), w, &response)
		return
	}
	obj = requestServerData
	result, err := query.Exec(obj.DiskType, obj.DiskSize, obj.NumOfCores, obj.TotalMemory, time.Now(), obj.HostID)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse("error occured while executing the database query. error: "+err.Error(), w, &response)
		return
	}
	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusAlreadyReported)
		printCpuDiskMemResponse(err.Error(), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printCpuDiskMemResponse("no rows affected", w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printCpuDiskMemResponse(fmt.Sprintf("updated data for cpu, memory, and disk for host with id '%s'", requestServerData.HostID), w, &response)

}

func RemoveCpuConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.NetworkConfig{}

	hostid := r.URL.Query().Get("hostid")
	log.Println("hostid: ", hostid)
	if hostid == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse("hostid id field is empty for the delete request", w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkAndGetCpuHostIfItExists(hostid, "hostid")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("host with id not present. '%s'", hostid), w, &response)
		return
	}

	dbConn := database.GetDBConnection()

	stmt, err := dbConn.Prepare("DELETE FROM inventory.cpudiskmem where cpudiskmem.hostid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("error '%s' occured for cpu, disk and memory request. : '%s'", err.Error(), hostid), w, &response)
		return
	}

	result, err := stmt.Exec(hostid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("error '%s' occured for cpu, disk and memory : '%s'", err.Error(), hostid), w, &response)
		return
	}

	if rowAffected, err := result.RowsAffected(); rowAffected == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printNetConfigResponse(fmt.Sprintf("error '%s' occured for cpu, disk and memory : '%s'", err.Error(), hostid), w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printNetConfigResponse(fmt.Sprintf("Deleted Cpu, Disk and Memory Config: '%s'", hostid), w, &response)
}

func GetPackage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := []model.Package{}

	hostid := r.URL.Query().Get("packagename")
	if hostid == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse("package name is empty", w, &response)
		return

	}
	query := "SELECT * FROM inventory.package where package.packagename=? limit 10"
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, hostid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		w.WriteHeader(http.StatusInternalServerError)
		printPackageResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, _ := ReadPackage(rows)
	if len(dbObj) == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse("either package data not found or does not exist for the search Package request", w, &response)
		return
	}
	// Loop through rows, using Scan to assign column data to struct fields.
	SetVulResponse(w, r, http.StatusOK)
	json.NewEncoder(w).Encode(dbObj)

}

func AddPackage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// default response object
	response := []model.Package{}

	var requestServerData model.Package
	dBConn := database.GetDBConnection()

	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(("decoding json request body failed : " + err.Error()), w, &response)
		return
	}

	// check if vul is present already in DB
	status, _, _ := checkAndGetPackageIfItExists(strings.ToLower(requestServerData.PackageName), "packagename")
	if status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("Package with id '%s' already present", strings.ToLower(requestServerData.PackageId)), w, &response)
		return
	}

	stmt, err := dBConn.Prepare("INSERT INTO inventory.package(packageid, packagename, permission, updatedate, version) VALUES(?,?,?,?,?)")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse(fmt.Sprintf("database prepared query error '%s' for request for package '%s'", err.Error(), requestServerData.PackageId), w, &response)
		return
	}

	result, err := stmt.Exec(uuid.NewString(), requestServerData.PackageName, requestServerData.Permission, time.Now(), requestServerData.Version)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse(fmt.Sprintf("database query execution error '%s' for request with package id '%s'", err.Error(), requestServerData.PackageId), w, &response)
		return
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse(fmt.Sprintf("database rows affected read error '%s' for request with package id '%s'", err.Error(), requestServerData.PackageId), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse(fmt.Sprintf("no rows affected for request for package '%s'", requestServerData.PackageName), w, &response)

		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printPackageResponse(fmt.Sprintf("added package data for package name '%s'", requestServerData.PackageName), w, &response)
}

func UpdatePackage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.Package{}

	// Read the request body
	var requestServerData model.Package
	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("decoding json request body failed for package update request. error: '%s'", err.Error()), w, &response)
		return
	}

	// Check whether hostname is empty
	if requestServerData.PackageId == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse("decoding json request-body failed for update package request. hostid not found", w, &response)
		return
	}

	// check if host is present already in DB
	status, obj, err := checkAndGetPackageIfItExists(requestServerData.PackageId, "id")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("host with id '%s' does not exists in table for update request. error: %s", requestServerData.PackageId, err.Error()), w, &response)
		return
	}

	// Save data into DB
	dBConn := database.GetDBConnection()
	query, err := dBConn.Prepare("UPDATE inventory.package set package.packagename=?,  package.permission=?,  package.updatedate=?,  package.version=? where package.packageid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse(err.Error(), w, &response)
		return
	}
	obj = requestServerData
	result, err := query.Exec(obj.PackageName, obj.Permission, time.Now(), obj.Version, obj.PackageId)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse("error occured while executing the database query. error: "+err.Error(), w, &response)
		return
	}
	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusAlreadyReported)
		printPackageResponse(err.Error(), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printPackageResponse("no rows affected", w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printPackageResponse(fmt.Sprintf("updated data for package with id '%s'", requestServerData.PackageId), w, &response)

}

func RemovePackage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.Package{}

	packageid := r.URL.Query().Get("packageid")
	log.Println("packageid: ", packageid)
	if packageid == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse("hostid id field is empty for the delete request", w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkAndGetPackageIfItExists(packageid, "packageid")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("package with id not present. '%s'", packageid), w, &response)
		return
	}

	dbConn := database.GetDBConnection()

	stmt, err := dbConn.Prepare("DELETE FROM inventory.package where package.packageid=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("error '%s' occured for package request. : '%s'", err.Error(), packageid), w, &response)
		return
	}

	result, err := stmt.Exec(packageid)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("error '%s' occured for package : '%s'", err.Error(), packageid), w, &response)
		return
	}

	if rowAffected, err := result.RowsAffected(); rowAffected == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printPackageResponse(fmt.Sprintf("error '%s' occured for package : '%s'", err.Error(), packageid), w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printPackageResponse(fmt.Sprintf("Deleted Package with id: '%s'", packageid), w, &response)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := []model.User{}

	email := r.URL.Query().Get("email")
	if email == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse("package name is empty", w, &response)
		return

	}
	query := "SELECT * FROM inventory.user where user.email=? limit 10"
	log.Println(query)

	dBConn := database.GetDBConnection()
	rows, err := dBConn.Query(query, email)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		w.WriteHeader(http.StatusInternalServerError)
		printUserResponse(fmt.Sprintf("'%s'", err.Error()), w, &response)
		return
	}
	if rows.Err() != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("'%s'", rows.Err().Error()), w, &response)
		return
	}

	// Read query result object
	dbObj, _ := ReadUser(rows)
	if len(dbObj) == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse("either user not found or does not exist for the search user request", w, &response)
		return
	}
	// Loop through rows, using Scan to assign column data to struct fields.
	SetVulResponse(w, r, http.StatusOK)
	json.NewEncoder(w).Encode(dbObj)

}

func AddUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// default response object
	response := []model.User{}

	var requestServerData model.User
	dBConn := database.GetDBConnection()

	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(("decoding json request body failed : " + err.Error()), w, &response)
		return
	}

	if requestServerData.Email == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse("email cannot be empty", w, &response)
		return
	}

	// check if vul is present already in DB
	status, _, _ := checkUser(requestServerData.Email, "email")
	if status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("User with id '%s' already present", strings.ToLower(requestServerData.Email)), w, &response)
		return
	}

	stmt, err := dBConn.Prepare("INSERT INTO inventory.user(username, email,password, groupname, updatedate, status) VALUES(?,?,?,?,?,?)")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse(fmt.Sprintf("database prepared query error '%s' for request for user with email '%s'", err.Error(), requestServerData.Email), w, &response)
		return
	}

	result, err := stmt.Exec(requestServerData.UserName, requestServerData.Email, requestServerData.Password, requestServerData.GroupName, time.Now(), requestServerData.Status)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse(fmt.Sprintf("database query execution error '%s' for request with package id '%s'", err.Error(), requestServerData.Email), w, &response)
		return
	}

	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse(fmt.Sprintf("database rows affected read error '%s' for request with package id '%s'", err.Error(), requestServerData.Email), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse(fmt.Sprintf("no rows affected for request for package '%s'", requestServerData.Email), w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printUserResponse(fmt.Sprintf("added user for email id id '%s'", requestServerData.Email), w, &response)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.User{}

	// Read the request body
	var requestServerData model.User
	err := json.NewDecoder(r.Body).Decode(&requestServerData)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("decoding json request body failed for user update request. error: '%s'", err.Error()), w, &response)
		return
	}

	// Check whether hostname is empty
	if requestServerData.Email == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse("decoding json request-body failed for update user request. hostid not found", w, &response)
		return
	}

	// check if host is present already in DB
	status, obj, err := checkUser(requestServerData.Email, "id")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("user with email '%s' does not exists in table for update user request. error: %s", requestServerData.Email, err.Error()), w, &response)
		return
	}

	// Save data into DB
	dBConn := database.GetDBConnection()
	query, err := dBConn.Prepare("UPDATE inventory.user set user.username=?, user.groupname=?,  user.updatedate=?, user.status=? where user.email=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse(err.Error(), w, &response)
		return
	}
	obj = requestServerData
	result, err := query.Exec(obj.UserName, obj.GroupName, time.Now(), obj.Status, obj.Email)
	if err != nil {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse("error occured while executing the database query. error: "+err.Error(), w, &response)
		return
	}
	rowAffected, err := result.RowsAffected()
	if err != nil {
		SetVulResponse(w, r, http.StatusAlreadyReported)
		printUserResponse(err.Error(), w, &response)
		return
	}
	if rowAffected <= 0 {
		SetVulResponse(w, r, http.StatusInternalServerError)
		printUserResponse("no rows affected", w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printUserResponse(fmt.Sprintf("updated user data for '%s'", requestServerData.Email), w, &response)

}

func RemoveUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := []model.User{}

	email := r.URL.Query().Get("email")
	log.Println("email: ", email)
	if email == "" {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse("email id field is empty for the delete request", w, &response)
		return
	}

	// check if host is present already in DB
	status, _, _ := checkUser(email, "packageid")
	if !status {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("user with emailid not present. '%s'", email), w, &response)
		return
	}

	dbConn := database.GetDBConnection()

	stmt, err := dbConn.Prepare("DELETE FROM inventory.user where user.email=?")
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("error '%s' occured for package request. : '%s'", err.Error(), email), w, &response)
		return
	}

	result, err := stmt.Exec(email)
	if err != nil {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("error '%s' occured for user : '%s'", err.Error(), email), w, &response)
		return
	}

	if rowAffected, err := result.RowsAffected(); rowAffected == 0 {
		SetVulResponse(w, r, http.StatusBadRequest)
		printUserResponse(fmt.Sprintf("error '%s' occured for user email : '%s'", err.Error(), email), w, &response)
		return
	}
	SetVulResponse(w, r, http.StatusOK)
	printUserResponse(fmt.Sprintf("Deleted User with emailid: '%s'", email), w, &response)
}
