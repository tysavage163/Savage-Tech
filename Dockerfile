# Use a slim, stable Node.js environment
FROM node:16-slim

# Install only the absolute essentials and clear cache immediately
RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Standard project setup
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Launch the engine
CMD ["node", "index.js"]
