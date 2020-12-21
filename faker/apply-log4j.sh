#!/bin/bash

DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR" || exit 1

for i in {1..20}; do
	TARGET="/www/slot/deploy/hydra/repo/mirror-sim-${i}/game-server/config/development"
	if [ ! -d "$TARGET" ]; then
		continue
	fi
	echo $TARGET
	cp "${DIR}/log4js.json" "${TARGET}/log4js.json"
done
