#!/bin/bash

PKG_JSON_MODULE=$(node -p "require('./package.json').type")
HERE="$0"
HERE_DIR=$(dirname -- "$HERE")

STOP=0
while [ "$STOP" -ne 1 ]; do
    N=$(readlink "$HERE")
    if [ "$N" = "" ]; then
        STOP=1
    else
        HERE="$N"
    fi
done

HERE=$(dirname -- "$HERE")
HERE="$HERE_DIR/$HERE"

if [ "$PKG_JSON_MODULE" = "commonjs" ]; then
    node "$HERE"/react-gtk.cjs "$@"
else
    if [ "$PKG_JSON_MODULE" = "module" ]; then
        node "$HERE"/react-gtk.mjs "$@"
    else
        node "$HERE"/react-gtk.js "$@"
    fi

fi
