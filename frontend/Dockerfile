FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set the working directory
WORKDIR /usr/src/app

# Copy the application code
COPY . .

# Install dependencies
RUN pnpm install

# Build
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 4173

# Set the port in the environment
ENV PORT=4173

# Command to run the application
CMD ["node", "--env-file=.env", "build"]
