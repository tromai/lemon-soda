FROM node:20.18.0-alpine as builder

# These packages are required for installing @discordjs/opus
RUN apk add --no-cache \
      build-base \
      python3

FROM builder as compile-source

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./
COPY ./src ./src

RUN npm install \
    && npm run build

FROM builder as deps-install

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --omit=dev

FROM node:20.18.0-alpine as final

WORKDIR /usr/lemon-soda

RUN apk add --no-cache ffmpeg

COPY --from=compile-source /usr/app/build/ ./build
COPY --from=deps-install /usr/app/node_modules ./node_modules

CMD ["node", "./build/index.js"]
