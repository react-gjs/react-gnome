#!/bin/bash

PKG_JSON_MODULE=$(cat package.json | grep '"type":' | sed 's/.*: "\(.*\)",\?/\1/')
HERE=$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")

if which ts-node >/dev/null 2>&1; then
    HAS_SWC=false
    if [ -e "node_modules/@swc/core/package.json" ]; then
        HAS_SWC=true
    fi

    if "$HAS_SWC" == true; then
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
            ts-node -T "$HERE"/react-gnome.cjs "$@"
        else
            if [ "$PKG_JSON_MODULE" = "module" ]; then
                ts-node-esm -T "$HERE"/react-gnome.mjs "$@"
            else
                ts-node -T "$HERE"/react-gnome.js "$@"
            fi
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
