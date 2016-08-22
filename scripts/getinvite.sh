#!/bin/sh

parent_path="$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )"

key=$(cat "configs/config.json" | grep "invitationKey" | sed -e 's/^.*: *\"\([^\"]*\)\"/\1/')
port=$(cat "configs/config.json" | grep "server" -C3 | grep "port" | sed -e 's/^.*: *\([0-9]*\)\,/\1/')
invite=$(curl -s --data "invitationkey=$key" http://localhost:$port/auth?todo=invite | sed -e 's/^.*: *\"\([^\"]*\)\"}/\1/')

echo $invite
