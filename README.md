# Quasar, Vue,Apollo,GraphQL,MongoDB App  and Python

A Quasar Framework app and Apollo with GraphQL SPA template

See Python menu item for example to run python script on server

## copy local src of app

```bash
git clone https://github.com/alexxsub/server-run-python.git
```

## Install MongoDB

see manual (https://docs.mongodb.com/manual/installation/)

## Install the dependencies

```bash
cd server-run-python
npm i
```

### Configure your app in .env, for example

```bash

PORT = 4001
BASE_URL=http://localhost:${PORT}/
MONGO_URI=mongodb://localhost:27017/demo_app
GRAPHQL_URI=${BASE_URL}api
DEBUG = false
SECRET=i_love_apollo
```

### Start the backend app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run server
```

### Start the frontend app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run client
```

### Lint the files

```bash
npm run lint
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
