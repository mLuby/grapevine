#!/bin/bash

COUNTER=0
LIMIT=10 # opening too many browsers is not recommended
while [ $COUNTER -lt $LIMIT ]; do
  open http://localhost:3000
  let COUNTER=COUNTER+1
done
