FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set the working directory
WORKDIR /usr/src/app

# Copy the application code and shared types
COPY ./frontend ./frontend
COPY ./shared ./shared

# Set the working directory to the backend
WORKDIR /usr/src/app/frontend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 4173

# Command to run the application
CMD ["node", "--env-file=.env", "build"]
