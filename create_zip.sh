#!/bin/bash

# Define the output zip file name
OUTPUT_ZIP="ManagedFiles.zip"

# Remove the old zip file if it exists
rm -f "$OUTPUT_ZIP"

# Create the new zip file, including only the necessary extension files and folders. 
# This prevents development files (like this script, README, etc.) from being included.
zip -r "$OUTPUT_ZIP" \
  "manifest.json" \
  "background.js" \
  "popup.html" \
  "popup.js" \
  "blocked.html" \
  "logs.html" \
  "logs.js" \
  "schema.json" \
  "assets"

echo "Zip file '$OUTPUT_ZIP' created successfully."