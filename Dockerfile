FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

ENV PORT=8000
ENV MAX_IMAGE_SIZE=10485760
ENV ALLOWED_DOMAINS=""

# Start the server using stdio
CMD ["node", "dist/index.js"] 