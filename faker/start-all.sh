#!/bin/bash -x

DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR" || exit 1

mkdir -p log

for i in {1..20}; do
	./monitor.sh "$i" > "log/$i.txt" 2>&1 &
done

wait
