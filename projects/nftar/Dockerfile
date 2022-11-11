# nftar/Dockerfile
FROM ubuntu:bionic

RUN apt update

# curl, plus Puppeteer Debian dependencies from https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
RUN apt install --yes curl ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# Need to install a better nodejs PPA than what's available via apt, and then yarn.
RUN curl --silent --location https://deb.nodesource.com/setup_16.x | bash
RUN apt install nodejs
RUN npm install --global yarn

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /api

COPY ["package.json", "package-lock.json*", "./"]
RUN yarn install --production
COPY . .
CMD [ "yarn", "start" ]