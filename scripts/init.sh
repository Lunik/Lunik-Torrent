#!/bin/sh
parent_path="$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )"

if ! [ -f configs/passwords.json ]
  then echo "==> Creating passwords.json"
  echo '{}' > $parent_path/../configs/passwords.json
fi

if ! [ -f configs/fileInfo.json ]
  then echo "==> Creating fileInfo"
  echo '{}' >> $parent_path/../configs/fileInfo.json
fi

for dir in files downloads logs;
do
  if ! [ -d $dir ]
    then echo "==> Creating $dir"
    mkdir $parent_path/../$dir
  fi
done

if ! [ -f torrents.txt ]
  then echo "==> Creating torrents"
  touch $parent_path/../torrents.txt
fi

if ! [ -f configs/config.json ]
  then echo "==> Copying configs"
  cp $parent_path/../configs/config.default $parent_path/../configs/config.json
fi
