
EC2HOST=ec2-18-130-237-108.eu-west-2.compute.amazonaws.com

#projdi='cognito/p2p_marketplace'
projdir=./

#dir='cognito/aws'
dir=../aws/ 

yarn build
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
    echo "1. deleting..."
    rm -rf ~/deploy
    mkdir -p ~/deploy/build

    echo "2. unzipping..."
    unzip -o ~/build.zip -d ~/deploy/

    echo "3. killing node service"
    app_pid=`ps auxw | grep server.js | grep -v grep | cut -d ' ' -f 2`

    if [[ -z $app_pid ]]; then
        echo "no server.js process found."
    else 
        echo "killing server.js process $app_pid"
        kill $app_pid
    fi

    echo "starting server.js ..."
    cd deploy
    nohup yarn server &>server.out &
    echo "done."
    ps auxw | grep server.js | grep -v grep | cut -d ' ' -f 2
ENDSSH

cd $projdir
echo "done."