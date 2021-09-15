// © 2021 Alexx Sub, https://github.com/alexxsub/
const app = require('express')(),
  express = require('express'),
  fileUpload = require('express-fileupload'),
  cors = require('cors'),
  morgan = require('morgan'),
  path = require('path'),
  { ApolloServer, AuthenticationError } = require('apollo-server-express'),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  typeDefs = require('./types'),
  resolvers = require('./resolvers'),
  context = require('./models'),
  http = require('http'),
  WebSocket = require('ws')

require('dotenv').config({ path: '../../.env' })
const port = process.env.PORT || 8080

mongoose
  .connect(
    process.env.MONGO_URI,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      retryWrites: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log(`🎉  Mongo connected ${process.env.MONGO_URI}`))
  .catch((err) => console.error(err))

// Verify JWT Token passed from client
const getUser = async (token, signin) => {
  if (signin) return ''
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET)
    } catch (err) {
      throw new AuthenticationError(
        'Authentication error: Please login again!'
      )
    }
  } else {
    throw new AuthenticationError(
      'Authentication error: You are not logged in!'
    )
  }
}
// enable files upload
app.use(fileUpload({
  createParentPath: true
}))
// Create Apollo/GraphQL Server using typeDefs, resolvers

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  formatError: (error) => {
    const rep = new Map([
      ['GraphQL error:', ''],
      ['Context creation failed:', ''],
      ['ENOENT:', '']
    ])

    rep.forEach((val, key) => {
      const msg = error.message
      error.message = msg.replace(key, val).trim()
    })

    if (process.env.DEBUG !== 'true') {
      if (Object.prototype.hasOwnProperty.call(error.extensions, 'exception')) { delete error.extensions.exception }
    }
    return error
  },
  context: async ({ req }) => {
    // list of queries without autentifacation
    const noAuth = ['IntrospectionQuery',
        'signIn',
        'signUp'],
      token = req.headers.token,
      query = req.body.operationName,
      signed = noAuth.includes(query)
    context.currentUser = await getUser(token, signed)
    context.pagination = req.body.variables.pagination
    context.filter = req.body.variables.filter
    context.userIP = req.ip.split(':').pop()
    return context
  }
})
// replace code 400 over 401 (correct)
const contextAuthError = (req, res, next) => {
  const origSend = res.send

  res.send = (content) => {
    if (res.statusCode === 400) {
      const errInfo = JSON.parse(content)
      if (errInfo.errors[0].extensions.code === 'UNAUTHENTICATED') {
        res.statusCode = 401
      }
    }
    return origSend.call(res, content)
  }
  next()
}
// eslint-disable-next-line no-unused-vars
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// add other middleware
app.use(express.static('uploads'))
app.use(cors())
app.use('/api', contextAuthError)// add 401 error code
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})
// app.use(morgan('dev'))
// custom logger
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.date(req, res, 'clf'),
    tokens['remote-addr'](req, res),
    tokens.method(req, res),
    //   req.body.operationName,
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))

app.post('/upload', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      const uploadfile = req.files

      Object.keys(uploadfile).forEach(key => {
        const dst = path.join(__dirname, 'uploads/', uploadfile[key].name)
        uploadfile[key].mv(dst, err => console.log(err))
      })

      // send response
      res.send({
        status: true,
        message: 'Files is uploaded'
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

app.post('/upload2', async (req, res, next) => {
  if (!req.files) {
    res.status(500).send('No file uploaded')
  } else {
    const uploadfile = req.files,
      fileID = `${(+new Date()).toString(16)}`,
      ext = uploadfile.file.name.split('.').pop(),
      filename = fileID + '.' + ext,
      dst = path.join(__dirname, 'uploads/', filename)

    uploadfile.file.mv(dst, err => console.log(err))

    // send response
    res.send({
      status: true,
      file: filename
    })
  }
})
const SCRIPT_PATH = path.join(__dirname, 'scripts/calc.py')

app.get('/run', function (req, res) {
  const scriptProcess = spawn('python', [
    SCRIPT_PATH,
    '-a', req.query.a, '-b', req.query.b
  ])
  var t = 'text/plain'
  if (platform === 'win32') t += '; charset=cp1251'
  res.set('Content-Type', t)
  scriptProcess.stdout.pipe(res)
  scriptProcess.stderr.pipe(res)
})
// start app
apollo.applyMiddleware({ app, path: '/api' })
server.listen(port, () =>
  console.log(`🚀  Started at http://localhost:${port}${apollo.graphqlPath}`)
)
const iconv = require('iconv-lite'),
  { platform } = require('process'),
  { spawn } = require('child_process')

function runScriptInWebsocket (ws, a, b) {
  var options = ['-u', SCRIPT_PATH]
  options.push('-a', a, '-b', b)

  const child = spawn('python', options)

  child.stdout.on('data', function (data) {
    if (platform === 'win32') { data = iconv.decode(data, 'cp1251') }
    ws.send(`>:${data}`)
  })
  child.stderr.on('data', function (data) {
    ws.send(`>:${data}`)
  })
  child.on('close', function () {
    ws.send('>:done\n')
  })
  child.on('exit', function (code, signal) {
    if (code !== 0) {
      ws.send(`>:Exit code ${code}\n`)
      ws.send(`>:Exit signal ${signal}\n`)
    }
  })
}

wss.on('connection', (ws) => {
  console.log('😁  WebSocket server connected ')

  ws.on('message', (msg) => {
    ws.send(`You sent -> ${msg}\n`)
    msg = JSON.parse(msg)

    if (msg.cmd === 'run') {
      runScriptInWebsocket(ws, msg.a, msg.b)
    }
  })
  ws.send('Connection with WebSocket server initialized\n')
})
