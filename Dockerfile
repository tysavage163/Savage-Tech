# Use a more stable base image
FROM node:16-buster

# Install dependencies with extra retry logic
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /root/SavageTech
COPY package.json .
RUN npm install
COPY . .
CMD ["node", "index.js"]
