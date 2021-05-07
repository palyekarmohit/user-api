FROM node:13-alpine

RUN mkdir -p /home/user-api

COPY ./ /home/user-api

EXPOSE 3000

# set default dir so that next commands executes in /home/user-api dir
WORKDIR /home/user-api

# will execute npm install in /home/user-api because of WORKDIR
RUN npm install

# no need for /home/user-api/server.js because of WORKDIR
CMD ["node", "server.js"]

