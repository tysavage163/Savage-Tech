# Use the official Node.js image (pre-built)
FROM node:16

# Set where the bot lives inside the server
WORKDIR /usr/src/app

# Install dependencies first (better for caching)
COPY package*.json ./
RUN npm install

# Copy your actual bot code
COPY . .

# Start the engine
CMD ["node", "index.js"]
