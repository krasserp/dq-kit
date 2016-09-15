#!/bin/bash
#create a new DQ or copy an existing one and rename the namespace to the new DQ name
#

read -p "Please enter newDQ to create a new DQ or cp to cpDQ an existing one " task
echo "you entered $task"
if [[ "$task" == "newDQ" ]]
then

    read -p "Please provide a name for your new DQ, remember only lowercase letters are allowed " dqName

    if [[ $dqName =~ [a-z] ]]
    then
        echo " create new DQ named   $dqName"
        git clone https://github.com/krasserp/dq-kit.git && mv dq-kit/dq-name $dqName && rm -r -f dq-kit && cd $dqName && find . -type f -exec sed -i "s/dq-name/$dqName/g" {} + && echo "you created a new DQ base template for $dqName"
    else
        echo " only lower case characters allowed to name your new DQ "
    fi


elif [[ "$task" == "cpDQ" ]]
then
    read -p "Please provide the path to the DQ you'd like to copy " dqPath
    read -p "Please provide a name for your copied DQ, remember only lowercase letters are allowed " dqName
    if [[ $dqName =~ [a-z] ]]
    then
        dqOldName=$(basename "$dqPath")
        echo " create new DQ named $dqName based on $dqPath"
        cp -r $dqPath $dqName && cd $dqName && find . -type f -exec sed -i "s/$dqOldName/$dqName/g" {} + && echo "you created a new DQ based on $dqOldName now named $dqName"
    else
        echo " only lower case characters allowed to name your new DQ "
    fi
else
    echo "either newDQ or cpDQ are the only two options when calling this script"
fi

