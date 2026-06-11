# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Limit memory during build
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy dependency files
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and compile
COPY . .
RUN npm run build

# Run Stage
FROM nginx:alpine

# Copy built files from the build stage to Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx template that supports dynamic $PORT injection
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Default port fallback
ENV PORT=80

# Expose port
EXPOSE 80
