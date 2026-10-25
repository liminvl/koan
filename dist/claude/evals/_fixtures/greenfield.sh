#!/bin/sh
# Shared eval fixture: a near-empty repo with no stated goal — nothing to seed
# an Objective from (the greenfield probe's shape, D-020).
set -e
cat > package.json <<'EOF'
{ "name": "app", "private": true, "scripts": { "start": "node index.js" } }
EOF
cat > index.js <<'EOF'
console.log("hello");
EOF
git init -q -b main
git add -A
git -c user.email=eval@koan -c user.name=koan commit -qm init
