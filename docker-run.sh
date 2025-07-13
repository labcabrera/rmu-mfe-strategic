#!/bin/bash

docker stop rmu-fe-strategic

docker rm rmu-fe-strategic

docker rmi labcabrera/rmu-fe-strategic:latest

docker build -t labcabrera/rmu-fe-strategic:latest .

docker run -d -p 8082:80 \
  --network rmu-network \
  --name rmu-fe-strategic \
  -h rmu-fe-strategic \
  -e RMU_FE_STRATEGIC_PUBLIC_PATH='http://localhost:8082/' \
  -e RMU_API_STRATEGIC_URL='http://api-strategic.rmu.local/v1' \
  -e RMU_API_CORE_URL='http://api-core.rmu.local/v1' \
  labcabrera/rmu-fe-strategic:latest

docker logs -f rmu-fe-strategic
