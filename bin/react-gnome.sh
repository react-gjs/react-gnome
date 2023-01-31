#!/bin/bash

PKG_JSON_MODULE=$(node -p "require('./package.json').type ?? 'commonjs'")
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

if which ts-node >/dev/null 2>&1; then

    if [ "$PKG_JSON_MODULE" = "commonjs" ]; then
        ts-node --swc "$HERE"/react-gnome.cjs "$@"
    else
        if [ "$PKG_JSON_MODULE" = "module" ]; then
            ts-node-esm --swc "$HERE"/react-gnome.mjs "$@"
        else
            ts-node --swc "$HERE"/react-gnome.js "$@"
        fi

    fi
else
    if [ "$PKG_JSON_MODULE" = "commonjs" ]; then
        node "$HERE"/react-gnome.cjs "$@"
    else
        if [ "$PKG_JSON_MODULE" = "module" ]; then
            node "$HERE"/react-gnome.mjs "$@"
        else
            node "$HERE"/react-gnome.js "$@"
        fi

    fi

fi
