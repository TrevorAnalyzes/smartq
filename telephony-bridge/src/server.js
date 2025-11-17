import express from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { TwilioMediaStreamHandler } from './handlers/twilio-handler.js'
import { logger } from './utils/logger.js'

// Load environment variables
dotenv.config()

console.log('Starting SmartQ Telephony Bridge...')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT || 3001)

const app = express()
const server = createServer(app)

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'smartq-telephony-bridge'
  })
})

// WebSocket server for Twilio Media Streams
const wss = new WebSocketServer({ 
  server,
  path: '/twilio-stream'
})

wss.on('connection', (ws, req) => {
  logger.info('New WebSocket connection established', {
    url: req.url,
    headers: req.headers
  })

  // Create handler for this connection
  const handler = new TwilioMediaStreamHandler(ws, req)
  
  ws.on('message', (message) => {
    handler.handleMessage(message)
  })

  ws.on('close', (code, reason) => {
    logger.info('WebSocket connection closed', { code, reason: reason.toString() })
    handler.cleanup()
  })

  ws.on('error', (error) => {
    logger.error('WebSocket error', { error: error.message })
    handler.cleanup()
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`SmartQ Telephony Bridge listening on port ${PORT}`)
  logger.info(`Health endpoint: http://localhost:${PORT}/health`)
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}/twilio-stream`)
}).on('error', (err) => {
  logger.error('Server failed to start', { error: err.message })
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`)
  }
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})
