# Use Node.js official image
FROM node:18

# Install dependencies for qpdf
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    libjpeg62-turbo \
    zlib1g \
    libgnutls30 && \
    rm -rf /var/lib/apt/lists/*

# Download and install qpdf from GitHub releases
RUN cd /tmp && \
    wget https://github.com/qpdf/qpdf/releases/download/v11.9.0/qpdf-11.9.0-x86_64.AppImage && \
    chmod +x qpdf-11.9.0-x86_64.AppImage && \
    ./qpdf-11.9.0-x86_64.AppImage --appimage-extract && \
    mv squashfs-root /opt/qpdf && \
    ln -s /opt/qpdf/usr/bin/qpdf /usr/local/bin/qpdf && \
    rm qpdf-11.9.0-x86_64.AppImage

# Verify qpdf installation
RUN qpdf --version

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
