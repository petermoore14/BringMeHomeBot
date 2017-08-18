
USER=$1
PASS=$2
BUILD=$3
STACK=$4

docker login docker.uncharted.software -u=$1 -p=$1
docker stack deploy --compose-file /tmp/${BUILD}-docker-compose.yml --with-registry-auth=true ${STACK}
