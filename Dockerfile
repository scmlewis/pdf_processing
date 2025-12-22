# Use Node.js official image
FROM node:18

# Install qpdf system package (force rebuild)
RUN apt-get update && \
    apt-get install -y --no-install-recommends qpdf && \
    rm -rf /var/lib/apt/lists/* && \
    echo "qpdf installation complete"

# Verify qpdf installation
RUN which qpdf || echo "ERROR: qpdf not found in PATH"
RUN qpdf --version || echo "ERROR: qpdf command failed"
RUN ls -la /usr/bin/qpdf || echo "ERROR: /usr/bin/qpdf does not exist"

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

# Create uploads directory with proper permissions
RUN mkdir -p /app/server/uploads && chmod 777 /app/server/uploads

# Expose port
EXPOSE 5000

# Set PORT environment variable for Render
ENV PORT=5000

# Start server
CMD ["node", "server/index.js"]
