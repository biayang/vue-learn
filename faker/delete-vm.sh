#!/bin/bash

for i in {1..8}
do
   BR="test/t${i}"

   git co baiyang/simulation-nomerge
   git br -D "$BR"
   git del-remote-branch "$BR"
   git co -b "$BR"
   git push --set-upstream origin "$BR"

done
