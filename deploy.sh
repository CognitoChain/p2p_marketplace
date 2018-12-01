
#### INPUT PARAMETERS ####
## env: the environemnt to deploy to (e.g [int|stg])
## build_artefact: file to deploy (e.g build.zip)
env=$1
build_artefact=$2

if [ "$env" = "int" ];
then
    echo "Deploying to Integration environment"
elif [ "$env" = "stg" ];
then
    echo "Deploying to Staging environment"
else 
    echo "usage: $0 [int|stg] build.zip"
    exit 1
fi

if [ ! -f $build_artefact ]; then
    build_artefact=`find /var/local/cognitochain/relayer/ -maxdepth 1 -type f -printf '%Ts\t%p\n' | grep .zip  | sort -nr | cut -f2 | head -1`
    if [ ! -f $build_artefact ]; then
         echo "Can't find build_artefact"
         exit 1;
    fi
fi

echo "Deploying $build_artefact to $relayer_host"


source ../aws/.config-${env}

EC2HOST=$relayer_host
EC2KEY=../aws/$relayer_key

scp -i ${EC2KEY} ${build_artefact} ec2-user@${EC2HOST}:

ssh -i ${EC2KEY} ec2-user@${EC2HOST} <<'EOF'

    buildfile=`find /home/ec2-user -maxdepth 1 -type f -printf '%Ts\t%p\n' | grep .zip  | sort -nr | cut -f2 | head -1`

	if [ ! -f $buildfile ]; then
 	   echo "`date` - ERROR: buildfile not found!" >> deployments.log
  	   exit 1;
	fi

    echo "1. deploying $buildfile"    
    fullfilename=$(basename $buildfile)
    filename=$(basename $buildfile .zip)
	deploydir=/var/local/cognitochain/relayer/$filename
	
    echo "`date` - deploy ${fullfilename} to ${deploydir}" >> deployments.log
    mkdir -p $deploydir
    unzip -o ~/$fullfilename -d $deploydir 1>/dev/null
    mv ~/$fullfilename /var/local/cognitochain/relayer/
    
   	echo "2. updating symlink"
    rm -f /usr/local/cognitochain/relayer
    ln -s ${deploydir} /usr/local/cognitochain/relayer
    
    echo "3. stopping 'relayer' service"
    sudo systemctl stop relayer

    echo "4. starting 'relayer' service ..."
    ##sudo systemctl daemon-reload
    sudo systemctl start relayer
    sudo systemctl status relayer

EOF
