FROM node:18-alpine

# Install dependencies for sharp image processing
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install TypeScript globally
RUN npm install -g typescript

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies for smaller image
RUN npm prune --production

ENV PORT=8000
ENV MAX_IMAGE_SIZE=10485760
ENV ALLOWED_DOMAINS=""

# Start the server using stdio
RUN chown -R node:node /app
USER node
EXPOSE 8000
CMD ["node", "dist/index.js"]