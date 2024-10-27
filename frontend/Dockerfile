FROM node:20-alpine AS build

# Set workdir
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json /app
COPY package-lock.json /app

# Install dependencies. Using npm ci is much faster be needs package-lock.json
RUN npm ci --verbose

# Copy project
COPY . .

# Build production code
RUN npm run build

#Define Nginx as webserver
FROM nginx:stable-alpine AS nginx

# Clear html dir
RUN rm -rf /usr/share/nginx/html/*

# Copy dist
COPY --from=build /app/dist /usr/share/nginx/html

#Copy the script that write the env variables into window._env_ to the entrypoint dir
COPY .docker/init/set_env.sh /docker-entrypoint.d/set_env.envsh

# Make it executable
RUN chmod +x /docker-entrypoint.d/set_env.envsh

