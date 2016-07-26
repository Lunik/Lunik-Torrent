#!/bin/sh

find test/cached_screenshots -exec diff $(echo {} | sed -e 's/cached_screenshots/screenshots/') \;
