FROM node:20

WORKDIR /doc-query

COPY . .

RUN npm install

RUN npm run build

CMD [ "npm", "start" ]