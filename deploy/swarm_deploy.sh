
USER=$1
PASS=$2
BUILD=$3
STACK=$4
REPO=https://docker.uncharted.software

echo Deploy stack ${BUILD}-docker-compose.yml as ${STACK}  
docker stack deploy --compose-file /tmp/${BUILD}-docker-compose.yml --with-registry-auth=true ${STACK}
