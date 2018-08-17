# STEP 1: BUILD
FROM node:10.9 AS build

ENV APP_HOME /usr/src/app

RUN npm install
RUN bower install
RUN gulp build

# STEP 2: PACKAGE
FROM nginx:alpine

ENV APP_HOME /usr/src/app
ENV DEFAULT /etc/nginx/sites-enabled/default

WORKDIR $APP_HOME
ADD ./docker $APP_HOME
COPY --from=build /usr/src/app/build /var/www/html/

RUN rm $DEFAULT
RUN mv default $DEFAULT

CMD ./start.sh
