# Use Node v8 as the base image.
FROM node:alpine

RUN apk update
RUN apk add git
WORKDIR /usr/src/app
RUN git clone https://github.com/foamtsp/security-webboard-backend.git

# Create app directory
WORKDIR /usr/src/app/security-webboard-backend

RUN npm install

#Expose port and start application
EXPOSE 9000
CMD [ "npm", "start" ]

# # --> Add everything in the current directory to our image, in the 'app' folder.
# ADD . /app

# # --> Install dependencies
# COPY package.json .
# COPY package-lock.json .
# RUN cd /app; \
# npm install --production; \
# npm install nodemon

# # --> Expose our server port.
# EXPOSE 8008
# VOLUME /app
# # --> Run our app.
# CMD ["npm", "start"]