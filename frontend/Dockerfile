# Multi-stage build for Next.js

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run the application
CMD ["node", "server.js"]
