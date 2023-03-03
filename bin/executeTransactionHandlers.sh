#!/bin/bash
for i in $(seq 1 10); do
  node src/scripts/executeTransactionHandlers.js >>log/executeTransactionHandlers.log 2>&1
  sleep 5
done
