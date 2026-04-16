#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Wait a few seconds for the Postgres database to come up
#
echo 'Waiting for the PostgreSQL database to be ready ...'
sleep 10

#
# Then create some test user accounts using the Curity Identity Server's liquibase feature
#
echo 'Creating test user accounts ...'
CONTAINER_ID=$(docker ps | grep idsvr | awk '{print $1}')
docker cp test-user-accounts.xml "$CONTAINER_ID:/opt/idsvr/etc/liquibase/"
docker exec -it "$CONTAINER_ID" bash -c "cd etc/liquibase && JDBC_URL=jdbc:postgresql://dbserver/idsvr JDBC_USERNAME=postgres JDBC_PASSWORD=Password1 idsvr -L ./test-user-accounts.xml"
if [ $? -ne 0 ]; then
  read -n 1
  exit 1
fi
