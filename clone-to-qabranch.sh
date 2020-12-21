#!/bin/bash
#将当前目录的game-config拷贝到QAUpdate分支
DIR="$(dirname "$(readlink -f "$0")")" && cd "$DIR" || exit 1

git stash

#git清除本地修改
cd ../videoslotQAStable || exit 1
echo 'goto videoslotQAStable, start checkout'
git checkout .
git clean -df
git pull

#这里用相对路径，如果目录变换记得跟新
echo 'start rsync'
rsync -avz --delete --exclude '/social_config/general_config.json' --exclude 'app_configs/slot_config/machine_reel/reel_file_list.json' --exclude '/config' --exclude '/app_configs/slot_config/machine_list.json' --exclude '/app_configs/slot_config/extra_config/' --exclude '/app_configs/slot_config/subject_tmpl_list/' ../videoslotconfig/game-configs/video_slots_dev/ ./game-configs/video_slots_dev/
rsync -avz --delete --exclude '/social_config/general_config.json' --exclude '/app_configs/slot_config/machine_reel/reel_file_list.json' --exclude '/config' --exclude '/app_configs/slot_config/machine_list.json' --exclude '/app_configs/slot_config/extra_config/' --exclude '/config' --exclude '/app_configs/slot_config/subject_tmpl_list/' ../videoslotconfig/game-configs/video_slots_prod/ ./game-configs/video_slots_prod/
git add --all
git commit -m "update configs from pm config buckit"
git push

cd ../videoslotQAUpdate || exit 1
echo 'start QA update pull'
git remote update origin --prune 
git checkout .
git clean -df
git pull

cd "$DIR" || exit 1
echo 'finish clone ,pop all stash'
git stash pop

exit 0
