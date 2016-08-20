#!/bin/sh

if ! [ -f configs/passwords.json ]
  then echo "==> Creating passwords.json"
  echo '{}' > configs/passwords.json
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
  if [ ${#INVITATION_CODE} -gt 0 ]
  then
    sed -i -e 's/MY_KEY/'$INVITATION_CODE'/' configs/config.json
  fi
fi
