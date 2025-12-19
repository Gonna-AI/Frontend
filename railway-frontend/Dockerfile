# Dockerfile for Frontend on Railway
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Install serve
RUN npm install -g serve

# Serve the built app (Railway sets PORT env var)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]

