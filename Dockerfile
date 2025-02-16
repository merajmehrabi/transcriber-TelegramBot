# Use Node.js as the base image
FROM node:18-slim

# Install FFmpeg and other dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Create directories for logs and temp files
RUN mkdir -p logs temp

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV DEBUG_MODE=false

# Expose any necessary ports (if needed in the future)
# EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
