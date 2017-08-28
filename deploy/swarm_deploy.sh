
DOCKER_REPO=$1
DOCKER_USER=$2
DOCKER_PASS=$3
BUILD=$4
STACK=$5

echo Login into ${DOCKER_REPO}
docker login ${DOCKER_REPO} --username "${DOCKER_USER}" --password "${DOCKER_PASS}"

echo Deploy stack ${BUILD}-docker-compose.yml as ${STACK}
cd /tmp
docker stack deploy --compose-file ${BUILD}-docker-compose.yml --with-registry-auth=true ${STACK}
