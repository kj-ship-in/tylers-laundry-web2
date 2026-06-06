#!/bin/bash

# Script to remove comments from TypeScript files
# This will remove single-line comments (//) and multi-line comments (/* */)
# but preserve ESLint disable comments that start with /* eslint-disable

find src -name "*.ts" -not -path "*/prisma/generated/*" | while read file; do
    echo "Processing: $file"
    
    # Remove single-line comments that aren't ESLint directives
    # Remove multi-line comments that aren't ESLint directives
    # Keep ESLint disable comments
    sed -i \
        -e '/\/\*.*eslint-disable.*\*\//!{/\/\*.*\*\//d}' \
        -e '/\/\*.*eslint-disable/!{/\/\*/,/\*\//d}' \
        -e 's/[[:space:]]*\/\/[[:space:]].*//' \
        "$file"
done

echo "Comment removal completed!"