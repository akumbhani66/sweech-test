FROM node:22-slim

WORKDIR /usr/src/app

# Install required packages including build tools for bcrypt
RUN apt-get update && apt-get install -y \
    netcat-traditional \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy prisma schema
COPY prisma ./prisma/

# Install dependencies and rebuild bcrypt for the container
RUN npm ci --legacy-peer-deps && \
    npm rebuild bcrypt --build-from-source

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"]