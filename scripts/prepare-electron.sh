#!/bin/bash
echo "Copying static files..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
mkdir -p .next/standalone/prisma
cp prisma/schema.prisma .next/standalone/prisma/schema.prisma
cp -r prisma/migrations .next/standalone/prisma/migrations
echo "Done!"