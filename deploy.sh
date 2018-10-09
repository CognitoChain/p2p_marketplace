
env=$1

if [ "$env" = "int" ];
then
    echo "Deploying to Integration environment"
elif [ "$env" = "stg" ];
then
    echo "Deploying to Staging environment"
else 
    echo "usage: $0 [int|stg]"
    exit 1
fi

source ../aws/.config-${env}

EC2HOST=$relayer_host
EC2KEY=$relayer_key

if [ -z "$build_file" ]; 
then 
    build_file="build.zip"
fi

if [ ! -f $build_file ]; then
    echo "build file $build_file not found!"
    exit 1;
fi

echo "Uploading $build_file to $EC2HOST"

scp -i ${EC2KEY} ${build_file} ec2-user@${EC2HOST}:

ssh -i ${EC2KEY}  ec2-user@${EC2HOST} <<'ENDSSH'
    echo "1. deleting ~/deploy dir ..."
    rm -rf ~/deploy
    mkdir -p ~/deploy/build

    echo "2. unzipping build.zip ..."
    unzip -o ~/build.zip -d ~/deploy/

    echo "3. stopping 'relayer' service"
    sudo systemctl stop relayer

    echo "4. coping new code onto destination dir ..."
    cp -R ~/deploy/* /usr/local/cognitochain/relayer/

    echo "5. starting 'relayer' service ..."
    #sudo systemctl daemon-reload
    sudo systemctl start relayer
    sudo systemctl status relayer

ENDSSH
