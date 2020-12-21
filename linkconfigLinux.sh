#! /bin/bash -e

APP_NAME="${1:-video_slots_dev}"

DIR=`readlink -f "$0"` && DIR=`dirname "$DIR"` && cd "$DIR" || exit 1

list=(

	config
	app_configs

)

for item in "${list[@]}"
do
	FILE="game-configs/$APP_NAME/$item"

	if [ ! -e "$FILE" ]; then
		>&2 echo config $FILE not found
		exit
	fi

	TARGET="game-server/$item"
	if [ -h "$TARGET" ]; then
		rm "$TARGET"
	fi

	echo link config file: $FILE
	ln -s "../$FILE" game-server/
done
