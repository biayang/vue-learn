#!/bin/bash
cd ../
if [ ! -d videoslotQAUpdate ];then
	git clone --depth 1 --single-branch --branch QA/updateConfigs git@bitbucket.org:funplus/videoslotserver.git  ./videoslotQAUpdate
	echo "videoslotQAUpdate checkout success"
else
	echo "videoslotQAUpdate is exist"
fi
