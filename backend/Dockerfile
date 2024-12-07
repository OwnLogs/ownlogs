FROM node:22-alpine

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set the working directory
WORKDIR /usr/src/app

# Copy the application code and shared types
COPY ./backend ./backend
COPY ./shared ./shared

# Set the working directory to the backend
WORKDIR /usr/src/app/backend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "--env-file=.env", "wait-for-db.js"]
