# nftar/Dockerfile

FROM node:lts-gallium

ENV NODE_ENV=production

ENV PORT=3000

WORKDIR /api

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --omit=dev

COPY . .

CMD [ "npm", "run", "start" ]
