FROM node:latest

# Set the working directory to /parse
WORKDIR /parse

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV APP_ID=myAppId
ENV MASTER_KEY=MASTER_KEY
ENV DATABASE_URI=mongodb://mongodb:27017
ENV PARSE_MOUNT=/parse
ENV CLOUD_CODE_MAIN=/parse/cloud/main.js
ENV PARSE_SERVER_API_VERSION=7

# Expose port 1337
EXPOSE 1337

# Start the Parse Server
CMD [ "npm", "start" ]
