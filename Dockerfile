FROM node:20-slim

WORKDIR /home/node/app

# RUN apt-get update && apt-get install -y openssl

USER node

CMD [ "npm", "run", "start:dev" ]