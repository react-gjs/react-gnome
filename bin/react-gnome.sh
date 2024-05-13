#!/bin/bash

PKG_JSON_MODULE=$(node -p "require('./package.json').type ?? 'commonjs'")
HERE=$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")

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
