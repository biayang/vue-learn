#!/bin/bash

for i in {1..8}
do

   cd "/www/slot/deploy/hydra/repo/test-t${i}" || exit 1
   git clean -df
   git pull --rebase
   make

done

git co baiyang/simulation-nomerge
