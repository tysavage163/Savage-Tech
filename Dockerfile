# Use a lightweight Node.js image
FROM node:lts-buster

# Install essential dependencies for WhatsApp Baileys and media processing
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /root/SavageTech

# Copy package files and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of your bot's code
COPY . .

# Start the bot engine
CMD ["node", "index.js"]
