# Use the official Node.js image as the base image
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy the application code
COPY . .

# Install dependencies
RUN npm install

# Build
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set the port in the environment
ENV PORT=3000

# Command to run the application
CMD ["node", "-r", "dotenv/config", "wait-for-db.js"]
