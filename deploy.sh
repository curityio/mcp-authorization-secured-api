#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM="MACOS"
 	;;

  MINGW64*)
    PLATFORM="WINDOWS"
	;;

  Linux)
    PLATFORM="LINUX"
	;;
esac

#
# First check there is a valid license file for the Curity Identity Server
#
if [ "$LICENSE_FILE_PATH" == '' ]; then
  echo '*** Please provide a LICENSE_FILE_PATH environment variable with the path to a Curity Identity Server license file'
  exit 1
fi

export LICENSE_KEY=$(cat "$LICENSE_FILE_PATH" | jq -r .License)
if [ "$LICENSE_KEY" == '' ]; then
  echo '*** An invalid license file was provided for the Curity Identity Server'
  exit 1
fi

#
# Some MCP clients may require HTTPS connections.
# Therefore, create development SSL certificates for external URLs.
#
./apigateway/certs/create.sh
if [ $? -ne 0 ]; then
  exit 1
fi
export EXTERNAL_ROOT_CA=$(cat ./apigateway/certs/example.ca.crt | openssl base64 | tr -d '\n')

#
# Pull up to date Docker images
#
docker pull postgres:latest
docker pull curity.azurecr.io/curity/idsvr:latest

#
# Spin up a child window that will create test user accounts once the PostgreSQL database is ready
#
if [ "$PLATFORM" == 'MACOS' ]; then

  open -a Terminal ./idsvr/data/import-test-users.sh

elif [ "$PLATFORM" == 'WINDOWS' ]; then
  
  GIT_BASH="C:\Program Files\Git\git-bash.exe"
  "$GIT_BASH" -c ./idsvr/data/import-test-users.sh &

elif [ "$PLATFORM" == 'LINUX' ]; then

  gnome-terminal -- ./idsvr/data/import-test-users.sh
fi

#
# Run the deployment to spin up all components
#
docker compose down
docker compose up
if [ $? -ne 0 ]; then
  exit 1
fi
