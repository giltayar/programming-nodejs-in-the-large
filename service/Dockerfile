FROM node:10
ARG NPM_FILE

ENV NODE_ENV=production

WORKDIR /home/node/app

COPY package*.json ./
RUN echo $NPM_FILE >.npmrc && \
    npm ci --production && \
    npm cache clear --force && rm -f .npmrc
COPY . .

EXPOSE 3000
ENV PORT=3000

USER node
CMD ["node", "--max-old-space-size=200", "src/run-in-the-large-service.js"]
