

# current dir
projdir=./

# build archives dir
target=./target


if [ -z "$GIT_COMMIT" ]; 
then 
    build_file="build.zip"
else
    build_file="${BUILD_ID}-${GIT_COMMIT}.zip"
fi

echo "build_file: $build_file"

if [ -z "$build_file" ]; 
then
    exit 1;
fi


# get dependencies and make prod build
mkdir -p $target/
rm -rf ./build
rm -rf ./node_modules
yarn install
yarn build

# create new build.zip in 'cognito/aws' dir
rm -f $target/*
zip -r $target/$build_file ./build 
zip -ru $target/$build_file ./public
zip -ru $target/$build_file ./scripts
zip -ru $target/$build_file ./config
zip -ru $target/$build_file ./data
zip -ru $target/$build_file ./node_modules
zip -u $target/$build_file ./server.js 
zip -u $target/$build_file ./package.json
