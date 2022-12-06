#!/bin/bash

PKG_JSON_MODULE=$(node -p "require('./package.json').type")

if [ "$PKG_JSON_MODULE" = "commonjs" ]; then
    node ./node_modules/react-gtk/bin/react-gtk.cjs "$@"
else
    if [ "$PKG_JSON_MODULE" = "module" ]; then
        node ./node_modules/react-gtk/bin/react-gtk.mjs "$@"
    else
        node ./node_modules/react-gtk/bin/react-gtk.js "$@"
    fi

fi
