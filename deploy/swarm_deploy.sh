
DOCKER_REPO=$1
AWS_ACCESS_KEY_ID=$2
AWS_SECRET_ACCESS_KEY=$3
BUILD=$4
STACK=$5

export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

echo Login into ${DOCKER_REPO}
`aws ecr get-login --no-include-email --region us-east-1`

echo Deploy stack ${BUILD}-docker-compose.yml as ${STACK}
cd /tmp
docker stack deploy --compose-file ${BUILD}-docker-compose.yml --with-registry-auth=true ${STACK}
