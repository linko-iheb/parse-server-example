FROM node:latest

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install

ENV APP_ID=myAppId
ENV MASTER_KEY=MASTER_KEY
ENV DATABASE_URI=mongodb://mongodb:27017
ENV PARSE_MOUNT=/parse

# Add Redis cache adapter configuration
ENV REDIS_URL=redis://redis:6379
EXPOSE 1337

CMD [ "npm", "start" ]
