# Stage 1: Build the frontend and backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package list files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build Vite frontend and esbuild server backend
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built assets and package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm ci --omit=dev

# Expose the application port (defaults to 3000, can be overridden by process.env.PORT)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
