# STEP 1: BUILD
FROM node:6.14 AS build

ENV APP_HOME /usr/src/app

ADD . $APP_HOME

RUN rm -rf /usr/src/app/build

WORKDIR $APP_HOME

RUN npm install
RUN npm install bower -g
RUN npm install gulp -g
RUN bower --allow-root install
RUN gulp build

# STEP 2: PACKAGE
FROM nginx:alpine

ENV APP_HOME /usr/src/app
ENV DEFAULT /etc/nginx/conf.d/default.conf

WORKDIR $APP_HOME
ADD ./docker $APP_HOME
COPY --from=build /usr/src/app/build /var/www/html/

RUN rm $DEFAULT
RUN mv default $DEFAULT

CMD ./start.sh
