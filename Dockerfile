# Use Node.js official image
FROM node:18

# Install qpdf system package
RUN apt-get update && apt-get install -y qpdf && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy application files
COPY . .

# Build React client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/index.js"]
