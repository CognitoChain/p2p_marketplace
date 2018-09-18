
EC2HOST=ec2-18-130-237-108.eu-west-2.compute.amazonaws.com

#projdi='cognito/p2p_marketplace'
projdir=./

#dir='cognito/aws'
dir=../aws/ 

yarn build
if [ $? -ne 0 ] 
then
  echo "yarn build exited with error $?"
  exit 1
fi

rm -f $dir/build.zip

# create new build.zip in 'cognito/aws' dir
zip -r $dir/build.zip ./build 
zip -ru $dir/build.zip ./public
zip -ru $dir/build.zip ./scripts
zip -ru $dir/build.zip ./config
zip -ru $dir/build.zip ./data
zip -ru $dir/build.zip ./node_modules
zip -u $dir/build.zip ./server.js 
zip -u $dir/build.zip ./package.json
zip -u $dir/build.zip ./package-lock.json

cd $dir

scp -i "MyEC2Key.pem" build.zip ec2-user@${EC2HOST}:
rm -f $dir/build.zip
ssh -i "MyEC2Key.pem"  ec2-user@${EC2HOST} <<'ENDSSH'
    echo "1. deleting ~/deploy dir ..."
    rm -rf ~/deploy
    mkdir -p ~/deploy/build

    echo "2. unzipping build.zip ..."
    unzip -o ~/build.zip -d ~/deploy/

    echo "3. stopping 'relayer' service"
    sudo systemctl stop relayer

    echo "4. coping new code onto destination dir ..."
    #sudo rm -rf /usr/local/cognitochain/relayer/*
    cp -R ~/deploy/* /usr/local/cognitochain/relayer/

    echo "5. starting 'relayer' service ..."
   
    sudo systemctl start relayer
    sudo systemctl status relayer

ENDSSH

cd $projdir
echo "done."