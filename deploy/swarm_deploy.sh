
BUILD=$1
STACK=$2

echo Deploy stack ${BUILD}-docker-compose.yml as ${STACK}
docker stack deploy --compose-file /tmp/${BUILD}-docker-compose.yml --with-registry-auth=true ${STACK}
