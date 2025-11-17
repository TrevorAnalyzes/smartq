import express from 'express'
import { createServer } from 'http'

const app = express()
const server = createServer(app)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

const PORT = 3001

server.listen(PORT, () => {
  console.log(`Test server listening on port ${PORT}`)
}).on('error', (err) => {
  console.error('Server error:', err)
})
