FROM node:8.4.0-alpine

RUN apk update
RUN apk upgrade
RUN apk add supervisor
RUN mkdir -p /var/log/supervisor

ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install

ADD deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ADD app.js app.js
ADD modules modules/

CMD ["/usr/bin/supervisord"]