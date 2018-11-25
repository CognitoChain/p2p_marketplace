

# current dir
projdir=./

# build archives dir
target=./target


if [ -z "$1" ]
then
   echo "No target_env parameter supplied"
   exit 1
fi

# target_env value should be "alpha" or "prod"
target_env="$1"

if [ -z "$GIT_COMMIT" ]; 
then 
    build_file="build.zip"
else
    build_file="${BUILD_ID}-${GIT_COMMIT}-${target_env}.zip"
fi


echo "build_file: $build_file"
if [ -z "$build_file" ]; 
then
    exit 1;
fi


# build the app
yarn build
retVal=$?
if [ $retVal -ne 0 ]; then
    echo "yarn build exited with error $retVal"
    exit 1
fi

# create new build.zip artefact
zip -r $target/$build_file ./build 
zip -ru $target/$build_file ./public
zip -ru $target/$build_file ./scripts
zip -ru $target/$build_file ./config
zip -ru $target/$build_file ./data
zip -ru $target/$build_file ./node_modules
zip -u $target/$build_file ./server.js 
zip -u $target/$build_file ./package.json
zip -u $target/$build_file ./yarn.lock

