FROM node:20-alpine
WORKDIR /app
COPY package.json vite.config.js index.html ./
COPY src ./src
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "3000"]
