FROM node:13-alpine as build

ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json

WORKDIR /app

COPY config /app/config
COPY models /app/models
COPY routes /app/routes
COPY app.js /app

RUN apk --update --no-cache add --virtual build-dependencies git \
    && npm install \
    && apk del build-dependencies

CMD npm run start