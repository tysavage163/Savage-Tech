# Use Node 20 to fix the 'ReadableStream is not defined' error
FROM node:20

# Set where the bot lives inside the server
WORKDIR /usr/src/app

# Install dependencies first (better for caching)
COPY package*.json ./
RUN npm install

# Copy your actual bot code
COPY . .

# Tell Render which port the app is using (matches your index.js)
EXPOSE 10000

# Start the engine
CMD ["node", "index.js"]
