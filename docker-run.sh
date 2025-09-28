#!/bin/bash

docker stop rmu-mfe-strategic

docker rm rmu-mfe-strategic

docker rmi labcabrera/rmu-mfe-strategic:latest

docker build -t labcabrera/rmu-mfe-strategic:latest .

docker run -d -p 8082:80 \
  --network rmu-network \
  --name rmu-mfe-strategic \
  -h rmu-mfe-strategic \
  -e RMU_FE_STRATEGIC_PUBLIC_PATH='http://localhost:8082/' \
  -e RMU_API_STRATEGIC_URL='http://api-strategic.rmu.local/v1' \
  -e RMU_API_CORE_URL='http://api-core.rmu.local/v1' \
  labcabrera/rmu-mfe-strategic:latest

docker logs -f rmu-mfe-strategic
