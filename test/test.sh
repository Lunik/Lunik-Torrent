#!/bin/sh
PORT="5000"
DIRNAME="ok"
DIRNAME2="ok2"
FILENAME="thefile"
MAGNET="magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4" HASH="6a9759bffd5c0af65319979fb7832189f4f3c35d"

function start {
  npm start &
  pid=$!
}

function stop {
  kill $pid
}

function checkUp {
  curl -s http://localhost:$PORT >/dev/null
  code=$?
  if [[ $code -ne 0 ]]
  then
    stop
    exit $code
  else
    err=$(echo $res | grep err)
    if [[ ${#err} -gt 0 ]]
    then
      echo "\033[31m Get Error: \n $res"
      stop
      exit $code
    else
      echo '==> \033[32m Up \033[0m'
    fi
  fi
}

#node test/test.js

start

echo "\033[32m Sleep 10 \033[0m"
sleep 10
checkUp

# List-D
echo "\033[33m List-D \033[0m"
res=$(curl -s -u admin:admin --data "dir=/" http://localhost:$PORT/list-d)
checkUp

# List-T
echo "\033[33m List-T \033[0m"
res=$(curl -s -u admin:admin --data "" http://localhost:$PORT/list-t)
checkUp

# Mkdir-D
echo "\033[33m Mkdir-D \033[0m"
res=$(curl -s -u admin:admin --data "name=$DIRNAME&path=/" http://localhost:$PORT/mkdir-d)
checkUp

# Rename-D
echo "\033[33m Rename-D\033[0m"
res=$(curl -s -u admin:admin --data "path=/&oldname=$DIRNAME&newname=$DIRNAME2" http://localhost:$PORT/rename-d)
checkUp

# Mkdir-D
echo "\033[33m Mkdir-D \033[0m"
res=$(curl -s -u admin:admin --data "name=$DIRNAME&path=/" http://localhost:$PORT/mkdir-d)
checkUp

# Mv-D
echo "\033[33m Mv-D \033[0m"
res=$(curl -s -u admin:admin --data "path=/&file=$DIRNAME2&folder=$DIRNAME" http://localhost:$PORT/mv-d)
checkUp

echo date > files/$FILENAME

# Files
echo "\033[33m Files \033[0m"
res=$(curl -s -u admin:admin http://localhost:$PORT/files\?f=$FILENAME)
checkUp

# Download-T
echo "\033[33m Download-T \033[0m"
res=$(curl -s -u admin:admin --data "url=$MAGNET" http://localhost:$PORT/download-t)
checkUp

echo "\033[32m Sleep 15 \033[0m"
sleep 15

# List-T
echo "\033[33m List-T \033[0m"
res=$(curl -s -u admin:admin --data "" http://localhost:$PORT/list-t)
checkUp

# Remove-T
echo "\033[33m Remove-T \033[0m"
res=$(curl -s -u admin:admin --data "hash=$HASH" http://localhost:$PORT/remove-t)
checkUp

# Lock-T
echo "\033[33m Lock-T \033[0m"
res=$(curl -s -u admin:admin http://localhost:$PORT/lock-d?f=$FILENAME)
checkUp

stop
