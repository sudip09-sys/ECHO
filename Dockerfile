FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY dist ./dist
COPY server.mjs package.json ./
EXPOSE 3001
CMD ["node","server.mjs"]
