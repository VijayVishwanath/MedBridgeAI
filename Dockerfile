# Use an official lightweight Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Vite React frontend
RUN npm run build

# Expose the Cloud Run default port (used by backend)
EXPOSE 8080

# Configure environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start the secure unified server
CMD ["npm", "start"]
