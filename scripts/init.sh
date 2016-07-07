#!/bin/sh

if ! [ -f configs/.htpasswd ]
  then echo 'admin:admin' >> configs/.htpasswd
fi

mkdir files
mkdir downloads
mkdir logs

touch torrents.txt

cp configs/config.default configs/config.json
