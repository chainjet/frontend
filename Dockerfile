FROM node:14

# context path: ./
COPY ./frontend /app/chainjet/frontend
COPY ./backend/generated/graphql.ts /app/chainjet/backend/generated/graphql.ts
WORKDIR /app/chainjet/frontend

RUN yarn
RUN yarn build

CMD [ "yarn", "start" ]

EXPOSE 3000
