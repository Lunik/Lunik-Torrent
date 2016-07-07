#!/bin/sh

if ! [ -f configs/.htpasswd ]
  then echo "==> Creating htpasswd"
  echo 'admin:admin' >> configs/.htpasswd
fi

if ! [ -f configs/fileInfo.json ]
  then echo "==> Creating fileInfo"
  echo '{}' >> configs/fileInfo.json
fi

for dir in files downloads logs;
do
  if ! [ -d $dir ]
    then echo "==> Creating $dir"
    mkdir $dir
  fi
done

if ! [ -f torrents.txt ]
  then echo "==> Creating torrents"
  touch torrents.txt
fi

if ! [ -f configs/config.json ]
  then echo "==> Copying configs"
  cp configs/config.default configs/config.json
fi
