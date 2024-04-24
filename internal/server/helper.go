package server

import (
	"database/sql"
	"errors"
	"inventory-manager/model"
	"log"
	"net/http"
)

// compare and modify original database entry
func CheckModifyDbObj(obj model.DbObj, requestData model.Host) model.DbObj {
	log.Println(obj.Host)
	log.Println(requestData)
	if obj.Host == requestData {
		return obj
	}
	if obj.Host.Region != requestData.Region && requestData.Region != "" {
		obj.Host.Region = requestData.Region
		log.Println("diff region")
	}
	if obj.Host.DataCenter != requestData.DataCenter && requestData.DataCenter != "" {
		log.Println(obj.Host.DataCenter)
		log.Println(requestData.DataCenter)
		obj.Host.DataCenter = requestData.DataCenter
		log.Println("diff dc")
	}
	if obj.Host.OS != requestData.OS && requestData.OS != "" {
		obj.Host.OS = requestData.OS
		log.Println("diff os")
	}
	if obj.Host.Owners != requestData.Owners && requestData.Owners != "" {
		obj.Host.Owners = requestData.Owners
		log.Println("diff owner")
	}

	if obj.Host.Environment != requestData.Environment && requestData.Environment != "" {
		obj.Host.Environment = requestData.Environment
	}

	if obj.Host.Ip != requestData.Ip && requestData.Ip != "" {
		obj.Host.Ip = requestData.Ip
	}

	if obj.Host.Status != requestData.Status && requestData.Status != "" {
		obj.Host.Status = requestData.Status
	}
	return obj
}

// func ReadAndVerifyException(w http.ResponseWriter, r *http.Request, requestType string) (error, bool, model.Response, model.Exception) {
// 	w.Header().Set("Content-Type", "application/json")
// 	var err error
// 	response := model.Response{
// 		StatusCode: http.StatusInternalServerError, // TODO: self declared error codes for server and api communication
// 		Error:      "internal server error. please try again",
// 		Message:    "server experienced issues while executing the query on table",
// 		Data:       []model.Exception{},
// 	}

// 	var exceptionRequestData model.Exception
// 	err = json.NewDecoder(r.Body).Decode(&exceptionRequestData)
// 	if err != nil {
// 		log.Println("decoding json request body failed : ", err.Error())
// 		SetResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "decoding request failed", err.Error())
// 		json.NewEncoder(w).Encode(response)
// 		return err, false, response, exceptionRequestData
// 	}

// 	flag := VerifyExceptionRequestBody(&exceptionRequestData)
// 	if !flag {
// 		log.Println("one or more required fields of exception request data are missing")
// 		SetResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "missing or invalid data", "required fields for exception - expiry date, vm id, exception status('pending','approved','denied'), approver, approving for reason, exception tag('vm level','appcode level', approved by- email with only @tesla.com are supported and separated by comma(ex:- abc@tesla.com,xyz@tesla.com))")
// 		json.NewEncoder(w).Encode(response)
// 		return err, false, response, exceptionRequestData
// 	}

// 	flag = CheckVMOrExceptionIdIfItExists(exceptionRequestData.VmID, "vminfo")
// 	if !flag {
// 		log.Println("VM not found")
// 		SetResponse(w, r, &response, http.StatusBadRequest, http.StatusBadRequest, "vm not found", fmt.Sprintf("vm with id: '%s' not found", exceptionRequestData.VmID))
// 		json.NewEncoder(w).Encode(response)
// 		return err, flag, response, exceptionRequestData
// 	}
// 	return err, true, response, exceptionRequestData
// }

// func VerifyExceptionRequestBody(exceptionRequestData *model.Exception) bool {
// 	allCheckflag := false
// 	statusFlag := false
// 	tagFlag := false
// 	verifyEmail := false
// 	exception_status := []string{"approved", "pending", "denied"}
// 	exception_tag := []string{"vm", "appcode"}
// 	log.Println(exceptionRequestData)
// 	if exceptionRequestData.ExpiryDate != "" && exceptionRequestData.ExceptionStatus != "" && exceptionRequestData.VmID != "" && exceptionRequestData.ApprovedBy != "" && exceptionRequestData.Reason != "" {
// 		allCheckflag = true
// 	}
// 	if slices.Contains(exception_tag, exceptionRequestData.ExceptionTag) {
// 		tagFlag = true
// 	}
// 	if slices.Contains(exception_status, exceptionRequestData.ExceptionStatus) {
// 		statusFlag = true
// 	}
// 	verifyEmail = ValidateEmails(exceptionRequestData.ApprovedBy)
// 	log.Println("all check: ", allCheckflag, "tagflag: ", tagFlag, "statusFlag: ", statusFlag, "verifyEmail: ", verifyEmail)
// 	return tagFlag && statusFlag && allCheckflag && verifyEmail
// }

func SetHostResponse(w http.ResponseWriter, r *http.Request, responseObj *model.HostResponse, httpStatusCode int, statusCode int, errorStr string, message string) {
	w.WriteHeader(httpStatusCode)
	responseObj.StatusCode = statusCode
	responseObj.Error = errorStr
	responseObj.Message = message
	responseObj.StatusCode = httpStatusCode
}

func SetHostDataResponse(w http.ResponseWriter, r *http.Request, httpStatusCode int) {
	w.WriteHeader(httpStatusCode)
}

func SetVulResponse(w http.ResponseWriter, r *http.Request, httpStatusCode int) {
	w.WriteHeader(httpStatusCode)
}

func ReadDbVulObj(rows *sql.Rows) ([]model.DbVulnerability, error) {
	var dbObj []model.DbVulnerability
	for rows.Next() {
		var obj model.DbVulnerability
		err := rows.Scan(&obj.VulnerabilityId, &obj.Description, &obj.VulnerabilityName, &obj.DetectionDate, &obj.Severity, &obj.Status)
		if err != nil {
			return dbObj, err
		}
		dbObj = append(dbObj, obj)
	}
	log.Println(len(dbObj))
	return dbObj, errors.New("no error found")
}

func ReadNetworkConfigObj(rows *sql.Rows) ([]model.NetworkConfig, error) {
	var dbObj []model.NetworkConfig
	for rows.Next() {
		var obj model.NetworkConfig
		err := rows.Scan(&obj.HostId, &obj.MacAddr, &obj.Ports, &obj.SubnetMask, &obj.DnsServer, &obj.UpdateDate, &obj.Gateway)
		if err != nil {
			return dbObj, err
		}
		dbObj = append(dbObj, obj)
	}
	log.Println(len(dbObj))
	return dbObj, errors.New("no error found")
}
func ReadCpuDiskMem(rows *sql.Rows) ([]model.CpuDiskMem, error) {
	var dbObj []model.CpuDiskMem
	for rows.Next() {
		var obj model.CpuDiskMem
		err := rows.Scan(&obj.HostID, &obj.DiskType, &obj.DiskSize, &obj.NumOfCores, &obj.TotalMemory, &obj.Updated_at)
		if err != nil {
			return dbObj, err
		}
		dbObj = append(dbObj, obj)
	}
	log.Println(len(dbObj))
	return dbObj, errors.New("no error found")
}

func ReadPackage(rows *sql.Rows) ([]model.Package, error) {
	var dbObj []model.Package
	for rows.Next() {
		var obj model.Package
		err := rows.Scan(&obj.PackageName, &obj.PackageId, &obj.Permission, &obj.UpdateDate, &obj.Version)
		if err != nil {
			return dbObj, err
		}
		dbObj = append(dbObj, obj)
	}
	log.Println(len(dbObj))
	return dbObj, errors.New("no error found")
}
func ReadUser(rows *sql.Rows) ([]model.User, error) {
	var dbObj []model.User
	for rows.Next() {
		var obj model.User

		err := rows.Scan(&obj.UserName, &obj.Email, &obj.GroupName, &obj.Updatedate, &obj.Password, &obj.Status)
		if err != nil {
			return dbObj, err
		}
		log.Println(obj)
		dbObj = append(dbObj, obj)
	}
	log.Println(dbObj)
	log.Println(len(dbObj))
	return dbObj, errors.New("no error found")
}

// func CheckVMOrExceptionIdIfItExists(requestId string, tableToLookFor string) bool {
// 	dBConn := database.GetDBConnection()
// 	var id string
// 	prepareStatement := "SELECT id FROM inventory.host WHERE host.id=?"
// 	if tableToLookFor == "exception" {
// 		prepareStatement = "SELECT exception_id FROM inventory.exception WHERE exception.exception_id=?"
// 	}
// 	stmt, err := dBConn.Prepare(prepareStatement)
// 	if err != nil {
// 		log.Println(err.Error())
// 		return false
// 	}
// 	err = stmt.QueryRow(requestId).Scan(&id)
// 	if err != nil {
// 		return false
// 	}
// 	if id == requestId {
// 		return true
// 	}
// 	return false
// }

// func ValidateEmails(emailIDs string) bool {
// 	var emailIDsArray []string
// 	for _, email := range regexp.MustCompile(`\s*,\s*`).Split(emailIDs, -1) {
// 		emailIDsArray = append(emailIDsArray, email)
// 	}

// 	for _, email := range emailIDsArray {
// 		re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@tesla.com`)
// 		if !re.MatchString(email) {
// 			return false
// 		}
// 	}
// 	return true
// }

// func SetResponse(w http.ResponseWriter, r *http.Request, responseObj *model.Response, httpStatusCode int, statusCode int, errorStr string, message string) {
// 	w.WriteHeader(httpStatusCode)
// 	responseObj.StatusCode = statusCode
// 	responseObj.Error = errorStr
// 	responseObj.Message = message
// 	responseObj.StatusCode = httpStatusCode
// }

func ReadDbVmObj(rows *sql.Rows) ([]model.DbObj, error) {
	var dbObj []model.DbObj
	for rows.Next() {
		var obj model.DbObj
		err := rows.Scan(&obj.Host.Hostname, &obj.Host.HostId, &obj.Host.OS, &obj.Host.Owners, &obj.Host.DataCenter, &obj.Host.Environment, &obj.Host.Ip, &obj.Host.Region, &obj.Created_at, &obj.Updated_at, &obj.Host.Status)
		if err != nil {
			return dbObj, err
		}
		dbObj = append(dbObj, obj)
	}
	return dbObj, errors.New("Nothing found")
}

// func ReadDbExceptionObj(rows *sql.Rows) ([]model.Exception, error) {
// 	var dbObj []model.Exception
// 	for rows.Next() {
// 		var obj model.Exception
// 		err := rows.Scan(&obj.ExceptionID, &obj.VmID, &obj.Reason, &obj.ApprovedBy, &obj.ExceptionStatus, &obj.ExpiryDate, &obj.ExceptionTag, &obj.Created_at, &obj.Updated_at, &obj.Jira)
// 		if err != nil {
// 			return dbObj, err
// 		}
// 		dbObj = append(dbObj, obj)
// 	}
// 	return dbObj, nil
// }
