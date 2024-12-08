FROM node:22-alpine AS build
WORKDIR /app

COPY ./backend/package.json ./backend/
WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.npm npm install

# Copy the application code and shared types
WORKDIR /app
COPY ./backend ./backend
COPY ./shared ./shared

# Build
WORKDIR /app/backend
RUN npm run build

# Prod server
FROM node:22-alpine AS prod
WORKDIR /app/backend
COPY --from=build /app/backend/build build/
COPY --from=build /app/backend/node_modules node_modules/
COPY backend/package.json .
COPY backend/wait-for-db.js .
EXPOSE ${PORT}
CMD [ "node", "wait-for-db.js" ]
