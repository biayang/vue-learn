#!/bin/bash -ex

COUNT=100000

DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR" || exit 1

ID="${1:-1}"

REPO="/www/slot/deploy/hydra/repo/mirror-sim-${ID}/game-server"
if [ -d "/Users/baiyang" ]; then
	REPO="/Users/baiyang/work/code/videoSlotSimulation/game-server"
fi

echo "$ID"
echo "$REPO"

PORT=$(grep httpServerPort "${REPO}/config/connect.json" | grep -o -P "\d+")

list=(
# 10029
# 10081
# 10025
# 10091
# 10019
#  10012
# 10048
#  10082
# 10036
#10046
# 10041
# 10096
#  10026
# 10002
# 10018
# 10011
# 10010
# 10040
# 10034
# 10008
# 10009
# 10030
#10093
10099
)

while :
do

	for SUBJECT in "${list[@]}"; do

		if [ -e /tmp/stop-all ]; then
			exit
		fi

		echo "$SUBJECT"

		cd "$DIR"
		./simulation.js --port="$PORT" --machine-id="$SUBJECT" --count="$COUNT"

		# cd "$REPO"
		# make

		# sleep 20

	done
done
