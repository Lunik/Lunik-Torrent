#!/bin/sh

for dir in files downloads logs data;
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
