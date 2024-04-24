FROM golang:1.21.3-alpine as build

WORKDIR /it-inventory-manager-backend/

COPY internal/ internal/
COPY log/ log/
COPY model/ model/
COPY utils/ utils/
COPY go.mod go.mod
COPY cmd/ cmd/
COPY go.sum go.sum

COPY main.go main.go

RUN go mod tidy
RUN go build -o app .

FROM alpine
COPY --from=build /it-inventory-manager-backend/app /it-inventory-manager-backend/app

ENTRYPOINT ["/it-inventory-manager-backend/app"]