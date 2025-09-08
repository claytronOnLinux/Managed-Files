#!/bin/bash

# Navigate to the directory containing ManagedFiles
cd /home/claytron/Managed-Files/ManagedFiles

# Create the zip file in the parent directory, overwriting if it exists
# The -r option includes subdirectories, and ./* ensures all files/folders
# within ManagedFiles are included at the root of the zip.
zip -r ../ManagedFiles.zip ./*
