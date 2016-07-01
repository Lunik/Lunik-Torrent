#!/bin/sh

if ! [ -f .htpasswd ]
  then echo 'admin:admin' >> .htpasswd
fi

mkdir files
mkdir downloads
mkdir logs

touch torrents.txt

cp src/config.default src/config.json
