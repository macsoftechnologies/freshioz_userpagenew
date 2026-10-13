import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../../freshioz_db.json')

function sharedFreshiozDbPlugin() {
  return {
    name: 'freshioz-shared-db',
    configureServer(server) {
      server.middlewares.use('/api/freshioz-store', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          return res.end()
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(dbPath)) {
              const data = fs.readFileSync(dbPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              return res.end(data)
            } else {
              res.statusCode = 404
              return res.end(JSON.stringify({ error: 'DB file not found' }))
            }
          } catch (e) {
            res.statusCode = 500
            return res.end(JSON.stringify({ error: e.message }))
          }
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              JSON.parse(body)
              fs.writeFileSync(dbPath, body, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.statusCode = 400
              return res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sharedFreshiozDbPlugin()
  ],
  server: {
    host: true,
    port: 5173
  }
})
