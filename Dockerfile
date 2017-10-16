FROM node:8.7.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .

# For npm@5 or later, copy package-lock.json as well
COPY package.json package-lock.json ./

# RUN npm config ls -l
RUN npm install --verbose

# Bundle app source
COPY . .

CMD [ "npm", "start" ]