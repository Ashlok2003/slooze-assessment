# Base image
FROM node:22-alpine

# Working directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache openssl

# Install dependencies (only package files first for caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
