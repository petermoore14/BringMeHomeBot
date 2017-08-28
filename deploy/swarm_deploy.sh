
BUILD=$1
STACK=$2

echo Deploy stack ${BUILD}-docker-compose.yml as ${STACK}
cd /tmp
docker stack deploy --compose-file ${BUILD}-docker-compose.yml --with-registry-auth=true ${STACK}
