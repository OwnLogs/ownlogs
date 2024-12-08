FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY ./frontend/package.json ./frontend/
WORKDIR /app/frontend
RUN --mount=type=cache,target=/root/.npm npm install

# Copy the application code and shared types
WORKDIR /app
COPY ./frontend ./frontend
COPY ./shared ./shared

# Build
WORKDIR /app/frontend
RUN pnpm run build

# Prod server
FROM node:22-alpine AS prod
WORKDIR /app/frontend
COPY --from=build /app/frontend/build build/
COPY --from=build /app/frontend/node_modules node_modules/
COPY frontend/package.json .
EXPOSE ${PORT}
CMD [ "node", "build" ]
