import express from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const app = express()
const server = createServer(app)

// Health check endpoint
app.get('/health', (_req, res) => {
  console.log('Health check requested')
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'smartq-telephony-bridge',
  })
})

// WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/telnyx-stream',
})

wss.on('connection', (ws, _req) => {
  console.log('WebSocket connection established')

  ws.on('message', message => {
    console.log('Received message:', message.toString().substring(0, 100))
  })

  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })
})

const PORT = 3002

server.listen(PORT, () => {
  console.log(`Minimal server listening on port ${PORT}`)
  console.log(`Health: http://localhost:${PORT}/health`)
  console.log(`WebSocket: ws://localhost:${PORT}/telnyx-stream`)
})
