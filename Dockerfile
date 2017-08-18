FROM nodesource/node:6.3

RUN apt-get update
RUN apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor

ADD package.json package.json
RUN npm install

ADD deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ADD app.js app.js
ADD streams streams/

CMD ["/usr/bin/supervisord"]