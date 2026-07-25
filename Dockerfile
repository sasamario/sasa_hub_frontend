FROM node:22

WORKDIR /app

# node:22に同梱のnpm(10.9.8)にArborist関連の既知バグがあり、
# npm installが `Cannot read properties of null (reading 'edgesOut')` で失敗するため最新化する
RUN npm install -g npm@latest
