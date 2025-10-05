# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev ----------
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci \
  && npm install -g sequelize-cli@6.6.2
COPY . .
# (опц.) для healthcheck
# RUN apk add --no-cache curl
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "dev"]

# ---------- prod ----------
FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force \
  && npm install -g sequelize-cli@6.6.2
COPY . .
# (опц.) для healthcheck
# RUN apk add --no-cache curl
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start"]
