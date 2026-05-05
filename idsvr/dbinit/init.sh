#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

######################################################################################
# An example script that performs the following steps for the demo deployment:
# - Create the database schema if required
# - Upgrade the database schema if required
# - Import test users if required
#
# All commands use the JDBC_URL, JDBC_USERNAME and JDBC_PASSWORD environment variables
# The database user must have permissions to create schema objects, e.g. a DBO user
#
# Once the script completes, query data in the PostgreSQL container with this command:
# - export PGPASSWORD=Password1 && psql -p 5432 -d idsvr -U idsvr_user
#
# See product documentation for further details:
# - https://curity.io/docs/identity-server/facilities/data-sources/schema-migration/
######################################################################################

#
# Create the schema if it does not exist
#
echo 'Initializing the database schema if required ...'
/opt/idsvr/bin/idsvr -I
 if [ $? -ne 0 ]; then
  echo 'Problem encountered creating the database schema'
  exit 1
fi

#
# Upgrade the schema to the latest product version if required
#
echo 'Upgrading the database schema if required ...'
/opt/idsvr/bin/idsvr -L default
if [ $? -ne 0 ]; then
  echo 'Problem encountered upgrading the database schema'
  exit 1
fi

#
# Import test user accounts if they do not exist
#
echo 'Importing test user accounts if required ...'
cd /opt/idsvr/etc/liquibase
idsvr -L ./test-user-accounts.xml
if [ $? -ne 0 ]; then
  echo 'Problem encountered importing test user accounts'
  exit 1
fi
