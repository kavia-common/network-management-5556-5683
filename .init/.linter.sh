#!/bin/bash
cd /home/kavia/workspace/code-generation/network-management-5556-5683/FrontendApplication
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

