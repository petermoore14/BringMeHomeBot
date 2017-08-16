FROM nodesource/node:4.0

RUN apt-get update
RUN apt-get dist-upgrade -y
RUN apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ADD package.json package.json
RUN npm install

ADD app.js app.js
ADD streams streams/

ADD .env .env

CMD ["/usr/bin/supervisord"]