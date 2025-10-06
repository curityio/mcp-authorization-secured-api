#!/bin/bash

#########################################################
# Create development HTTPS certificates for external URLs
#########################################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Ensure the correct OpenSSL behavior on Windows
#
if [[ "$(uname -s)" == MINGW64* ]]; then
  export MSYS_NO_PATHCONV=1
fi

#
# Return if already created, to prevent the need to reconfigure trust on every deployment
#
if [ -f example.ssl.crt ]; then
  exit 0
fi

#
# Require up to date OpenSSL
#
OPENSSL_VERSION_3=$(openssl version | grep 'OpenSSL 3')
if [ "$OPENSSL_VERSION_3" == '' ]; then
  echo 'Please install openssl version 3 or higher before running this script'
fi

#
# Configure certificate names
#
ROOT_CERT_FILE_PREFIX='example.ca'
ROOT_CERT_DESCRIPTION='Development Root CA for demo.example'
SSL_CERT_FILE_PREFIX='example.ssl'
SSL_CERT_PASSWORD='Password1'
WILDCARD_DOMAIN_NAME='*.demo.example'

#
# Create a root CA for external certificates, to be trusted on the local computer
#
openssl ecparam -name prime256v1 -genkey -noout -out $ROOT_CERT_FILE_PREFIX.key
if [ $? -ne 0 ]; then
  exit 1
fi

openssl req -x509 \
    -new \
    -key $ROOT_CERT_FILE_PREFIX.key \
    -out $ROOT_CERT_FILE_PREFIX.crt \
    -subj "/CN=$ROOT_CERT_DESCRIPTION" \
    -addext 'basicConstraints=critical,CA:TRUE' \
    -days 3650
if [ $? -ne 0 ]; then
  exit 1
fi

#
# Create an SSL key pair for development
#
openssl ecparam -name prime256v1 -genkey -noout -out $SSL_CERT_FILE_PREFIX.key
if [ $? -ne 0 ]; then
  exit 1
fi

openssl req \
    -new \
    -key $SSL_CERT_FILE_PREFIX.key \
    -out $SSL_CERT_FILE_PREFIX.csr \
    -subj "/CN=$WILDCARD_DOMAIN_NAME" \
    -addext 'basicConstraints=critical,CA:FALSE'
if [ $? -ne 0 ]; then
  exit 1
fi

openssl x509 -req \
    -in $SSL_CERT_FILE_PREFIX.csr \
    -CA $ROOT_CERT_FILE_PREFIX.crt \
    -CAkey $ROOT_CERT_FILE_PREFIX.key \
    -out $SSL_CERT_FILE_PREFIX.crt \
    -days 365 \
    -extfile altnames.ext
if [ $? -ne 0 ]; then
  exit 1
fi

#
# Copy the root CA to trust to the desktop
#
cp example.ca.crt ~/Desktop/

#
# Clean up
#
rm *.csr 2>/dev/null
rm *.srl 2>/dev/null
exit 0
