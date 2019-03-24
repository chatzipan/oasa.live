#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage : ./build.sh lambdaName";
  exit 1;
fi

lambda=${1%/}; // # Removes trailing slashes
echo "Deploying $lambda";
cd ./src/lambda;
if [ $? -eq 0 ]; then
  echo "...."
else
  echo "Couldn't cd to directory $lambda. You may have mis-spelled the lambda/directory name";
  exit 1
fi

echo "Checking that aws-cli is installed"
which aws
if [ $? -eq 0 ]; then
  echo "aws-cli is installed, continuing..."
else
  echo "You need aws-cli to deploy this lambda. Google 'aws-cli install'"
  exit 1
fi

echo "removing old zip"
rm ./$lambda.zip;

echo "creating a new zip file"
zip $lambda.zip * -r -x .git/\* \*.sh tests/\* node_modules/aws-sdk/\* \*.zip

echo "Uploading $lambda to AWS";

aws lambda update-function-code --function-name $lambda --zip-file fileb://$(pwd)/$lambda.zip --publish

if [ $? -eq 0 ]; then
  echo "!! Upload successful !!"
else 
  echo "Upload failed"
  echo "If the error was a 400, check that there are no slashes in your lambda name"
  echo "Lambda name = $lambda"
  exit 1;
fi