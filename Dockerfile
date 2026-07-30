FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Copy Prisma schema before npm install so the postinstall
# hook (prisma generate) can find it
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]