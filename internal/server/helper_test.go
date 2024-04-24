package server

// func Test_ReadDbExceptionObj(t *testing.T) {
// 	type args struct {
// 		rows *sql.Rows
// 	}
// 	tests := []struct {
// 		name    string
// 		args    args
// 		want    []model.Exception
// 		wantErr bool
// 	}{}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			got, err := ReadDbExceptionObj(tt.args.rows)
// 			if (err != nil) != tt.wantErr {
// 				t.Errorf("readDbExceptionObj() error = %v, wantErr %v", err, tt.wantErr)
// 				return
// 			}
// 			if !reflect.DeepEqual(got, tt.want) {
// 				t.Errorf("readDbExceptionObj() = %v, want %v", got, tt.want)
// 			}
// 		})
// 	}
// }

// func Test_VerifyExceptionRequestBody(t *testing.T) {
// 	type args struct {
// 		exceptionRequestData *model.Exception
// 	}
// 	tests := []struct {
// 		name string
// 		args args
// 		want bool
// 	}{
// 		// TODO: Add test cases.
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			if got := VerifyExceptionRequestBody(tt.args.exceptionRequestData); got != tt.want {
// 				t.Errorf("verifyExceptionRequestBody() = %v, want %v", got, tt.want)
// 			}
// 		})
// 	}
// }
