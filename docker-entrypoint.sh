#!/bin/sh
set -e

echo "Aguardando deploy do contrato em $DEPLOYMENT_PATH ..."
until [ -f "$DEPLOYMENT_PATH" ] && [ -f "$ARTIFACTS_PATH" ]; do
  sleep 1
done

echo "Contrato encontrado. Iniciando API..."
exec npm start
