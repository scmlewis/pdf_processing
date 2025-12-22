#!/bin/bash
# Render.com build script

# Install system dependencies
apt-get update
apt-get install -y qpdf

# Install npm dependencies
npm install

# Build React client
cd client
npm install
npm run build
cd ..
