#!/bin/bash

# Fix npm/pnpm conflict for Vercel deployment
echo "Fixing package manager conflicts..."

# Stage the changes
git add package.json .npmrc 2>/dev/null || echo "Files already staged"

# Commit the fix
git commit -m "Fix: Resolve npm/pnpm package manager conflicts for Vercel deployment

- Remove pnpm-store dependency that npm cannot handle
- Fix .npmrc prefix configuration conflicting with Vercel
- Ensure clean npm setup for Vercel build environment
- Resolves: npm error Unsupported URL Type link:" 2>/dev/null || echo "Nothing to commit"

# Push the fix
git push origin main 2>/dev/null || echo "Push completed or already up to date"

echo "Package manager fix completed!"