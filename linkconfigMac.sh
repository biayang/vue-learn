#!/bin/bash
#set -x

if [[ $# -ne 2 ]]
then
	echo "Usage : $0 app_name"
	exit 1
fi

localPath=${PWD}
APP_NAME=$1
rm game-server/app_configs game-server/config
#switch local or QA
if [ $2 == "QA" ];then
	cd ../videoslotQAUpdate
	newPath=${PWD}
	ln -s ${newPath}/game-configs/$APP_NAME/config ${localPath}/game-server/
	ln -s ${newPath}/game-configs/$APP_NAME/app_configs ${localPath}/game-server/
else
	ln -s ../game-configs/$APP_NAME/config game-server/
	ln -s ../game-configs/$APP_NAME/app_configs game-server/
fi

