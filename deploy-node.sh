
dir=../aws
source ${dir}/.config

EC2HOST=$relayer_host
EC2KEY=$relayer_key

#projdi='cognito/p2p_marketplace'
projdir=./

#dir='cognito/aws'
dir=../aws/ 

# get dependencies and make prod build
yarn install
yarn build

# create new build.zip in 'cognito/aws' dir
rm -f $dir/build.zip
zip -r $dir/build.zip ./build 
zip -ru $dir/build.zip ./public
zip -ru $dir/build.zip ./scripts
zip -ru $dir/build.zip ./config
zip -ru $dir/build.zip ./data
zip -ru $dir/build.zip ./node_modules
zip -u $dir/build.zip ./server.js 
zip -u $dir/build.zip ./package.json

cd $dir

scp -i ${EC2KEY} build.zip ec2-user@${EC2HOST}:
rm -f $dir/build.zip
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

cd $projdir
echo "done."