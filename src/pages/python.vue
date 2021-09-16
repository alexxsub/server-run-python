<template>
  <q-page padding>
      <div class="row">
          <div class="col-2">
    <q-input v-model="a" label="A" />
    </div>
    <div class="col-1"></div>
    <div class="col-2">
    <q-input v-model="b" label="B" />
    </div>

    <div class="col-1"></div>
    <div class="col-2">
    <q-btn id="btnHTTP" color="primary" label="HTTP" @click="onHTTP" />
    </div>
    <div class="col-2">
    <q-btn id="btnWS" color="primary" label="WS" @click="onWS" />
    </div>
    <div class="col-2">
    <q-btn id="btnSSE" color="primary" label="SSE" @click="onSSE" />
    </div>

</div>
     <pre id="output" class="output" >... hit the button and wait for output ...</pre>
  </q-page>
</template>

<script>
import { CHECK_ACCESS } from 'src/queries'
/* global $ */
function runSSE (a, b) {
  $('#output').empty()
  $('#output').show()
  if (!window.EventSource) {
    // Internet Explorer или устаревшие браузеры
    appendWSText('\nServer-sent event not supported')

    return false
  }
  const eventSource = new EventSource(`http://localhost:4001/sse?a=${a}&b=${b}`, {
    withCredentials: true
  })
  eventSource.onopen = function (e) {
    appendWSText('\nEvent sourse opened')
  }

  eventSource.addEventListener('done', function (e) {
    appendWSText(`\nDone ${e.data}`)
    eventSource.close()
  })
  eventSource.addEventListener('error', function (e) {
    appendWSText(`\nError ${e.data}`)
    eventSource.close()
  })
  eventSource.onmessage = function (e) {
    appendWSText(`\n${e.data}`)
  }
}
function runHTTP (a, b) {
  $('#output').empty()
  $('#output').show()
  $('#btnRun').prop('disabled', true)
  $.get('http://localhost:4001/run',
    { a, b })
    .done(function (data) {
      $('#output').text(data)
    })
    .fail(function (data) {
      $('#output').text(JSON.stringify(data) || 'Error occurred')
    })
    .always(function () {
      $('#btnRun').prop('disabled', false)
    })
}
function runWS (a, b) {
  $('#output').empty()
  $('#output').show()

  openConnection(function (connection) {
    const msg = {
      cmd: 'run',
      a,
      b
    }
    connection.send(JSON.stringify(msg))
  })
}

function appendWSText (text) {
  var txt = $('#output').text()
  txt += (text)
  $('#output').text(txt)
}

var conn = {}
function openConnection (cb) {
  // uses global 'conn' object
  if (conn.readyState === undefined || conn.readyState > 1) {
    conn = new WebSocket('ws://localhost:4001/')
    conn.onopen = function () {
      appendWSText('\nSocket opened. ')
      if (typeof cb === 'function') {
        cb(conn)
      }
    }
    conn.onmessage = function (event) {
      var message = event.data
      appendWSText(message)
    }
    conn.onclose = function (event) {
      appendWSText('\nSocket closed')
    }
  } else if (typeof cb === 'function') {
    cb(conn)
  }
}

if (window.WebSocket === undefined) {
  appendWSText('\nWebSockets not supported')
} else {
  openConnection()
}
export default {
  name: 'Python',
  data () {
    return {
      a: '',
      b: ''
    }
  },
  apollo: {
    checkAccess: {
      query: CHECK_ACCESS,
      variables: { res: 'python' }
    }
  },
  methods: {
    onWS () {
      runWS(this.a, this.b)
    },
    onHTTP () {
      runHTTP(this.a, this.b)
    },
    onSSE () {
      runSSE(this.a, this.b)
    }
  }
}
</script>
<style>
.output {
    height:300px;
    overflow: auto;
    padding: 1rem;
    color: rgb(248, 249, 250);
    background-color: rgb(52, 58, 64);
}
</style>
