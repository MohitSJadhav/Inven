package model

type StringInterfaceMap map[string]interface{}

type Host struct {
	Hostname    string `json:"hostname"`
	HostId      string `json:"hostid"`
	Region      string `json:"region"`
	DataCenter  string `json:"datacenter"`
	OS          string `json:"os"`
	Owners      string `json:"owners"`
	Environment string `json:"environment"`
	Ip          string `json:"ip"`
	Status      string `json:"status"`
}

type Exception struct {
	ExceptionID     string `json:"exception_id"`
	VmID            string `json:"vmid_fk"`
	Reason          string `json:"reason"`
	ApprovedBy      string `json:"approved_by"`
	ExceptionStatus string `json:"exception_status"`
	ExpiryDate      string `json:"expiry_date"`
	ExceptionTag    string `json:"exception_tag"`
	Jira            string `json:"jira"`
	Created_at      string `json:"created_at"`
	Updated_at      string `json:"updated_at"`
}

type DbObj struct {
	Host       Host   `json:"host"`
	Created_at string `json:"created_at"`
	Updated_at string `json:"updated_at"`
}
type DbVulnerability struct {
	VulnerabilityId   string `json:"vulnerability_id"`
	VulnerabilityName string `json:"vulnerabilityname"`
	Severity          string `json:"severity"`
	Status            string `json:"status"`
	DetectionDate     string `json:"detectiondate"`
	Description       string `json:"description"`
}

type Hosts struct {
	Hosts []string `json:"hosts"`
}

type Response struct {
	StatusCode int         `json:"status"`
	Error      string      `json:"error"`
	Message    string      `json:"message"`
	Data       []Exception `json:"data"`
}
type HostResponse struct {
	StatusCode int    `json:"status"`
	Error      string `json:"error"`
	Message    string `json:"message"`
	Data       []Host `json:"data"`
}

type TokenRequest struct {
	Username string `json:"username"`
	Team     string `json:"team"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

type User struct {
	UserName   string `json:"username"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	GroupName  string `json:"groupname"`
	Status     string `json:"status"`
	Updatedate string `json:"updatedate"`
}

type Package struct {
	PackageName string `json:"packagename"`
	PackageId   string `json:"packageid"`
	Permission  string `json:"permission"`
	UpdateDate  string `json:"updatedate"`
	Version     string `json:"version"`
}

type CpuDiskMem struct {
	HostID      string `json:"hostid"`
	DiskType    string `json:"disktype"`
	DiskSize    string `json:"size"`
	NumOfCores  string `json:"numofcores"`
	TotalMemory string `json:"totalmemory"`
	Updated_at  string `json:"updated_at"`
}

type NetworkConfig struct {
	HostId     string `json: "hostid"`
	MacAddr    string `json: "macaddr"`
	Ports      string `json: "ports"`
	SubnetMask string `json: "subnetmask"`
	DnsServer  string `json: "dnsserver"`
	UpdateDate string `json: "updatedate"`
	Gateway    string `json: "gateway" `
}

type Vulnerability struct {
	VulnerabilityId   string `json:"vulnerabilityid`
	Description       string `json:"description"`
	VulnerabilityName string `json:"vulnerabilityname"`
	Severity          string `json:"severity"`
	Status            string `json:"status"`
}

type Service struct {
	ServiceId   string `json:"serviceid"`
	ServiceName string `json:"servicename"`
	Status      string `json:"status"`
	Description string `json:"description"`
}

type HostData struct {
	HostData          Host              `json:"hostdata"`
	NetworkData       NetworkConfig     `json:"networkdata"`
	PackageData       []Package         `json:"packagedata"`
	VulnerabilityData []DbVulnerability `json:"vulnerabilitydata"`
	CpuDiskMemData    CpuDiskMem        `json:"cpudiskmemdata"`
}
