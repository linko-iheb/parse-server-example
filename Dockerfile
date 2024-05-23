FROM node:latest

# Create a directory for Parse
RUN mkdir parse

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
ENV MASTER_KEY_IPS=::/0

# Expose port 1337
EXPOSE 1337

# Start the Parse Server
CMD [ "npm", "start" ]
