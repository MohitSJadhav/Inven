#!/bin/bash

echo "Enter the number of rows to generate:"
read num_rows

echo "Generating data..."

for i in $(seq 1 $num_rows); do
    id=$i
    hostname="hostname_$i"
    region="region_$i"
    vcenter="vcenter_$i"
    datacenter="datacenter_$i"
    os="os_$i"
    owners="owners_$i"
    cluster="cluster_$i"
    esxcluster="esxcluster_$i"
    environment="environment_$i"
    platform="platform_$i"
    labels="{\"key\": \"value\"}"
    port="port_$i"
    ip="ip_$i"
    puppet=$(((RANDOM % 2) == 0 ? 1 : 0))
    type="type_$i"
    created_at=$(date +"%Y-%m-%d %H:%M:%S")
    updated_at=$(date +"%Y-%m-%d %H:%M:%S")

    echo "$id $hostname $region $vcenter $datacenter $os $owners $cluster $esxcluster $environment $platform $labels $port $ip $puppet $type $created_at $updated_at" >> data.txt
done

echo "Data generation completed. Data saved in data.txt."