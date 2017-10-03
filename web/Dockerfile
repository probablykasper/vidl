FROM node:8.6

RUN npm install -g  nodemon@1.12.1

RUN npm install     base32@0.0.6

RUN npm install     express@4.16.1

RUN npm install     pug@2.0.0-rc.4
RUN npm install     node-sass@4.5.3
RUN npm install     fs-path@0.0.23

RUN npm install     youtube-dl@1.12.2

WORKDIR /usr/src/app

COPY src .

CMD ["npm", "run", "start"]
