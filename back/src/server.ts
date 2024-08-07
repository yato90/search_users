import http, { IncomingMessage, ServerResponse } from 'http'
import url from 'url'
import { validateInput, searchUsers } from './userController'

let currentTimeout: NodeJS.Timeout | null = null

const requestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  const parsedUrl = url.parse(req.url || '', true)
  const method = req.method?.toUpperCase()

  // Добавление заголовков CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (parsedUrl.pathname === '/search' && method === 'POST') {
    if (currentTimeout) {
      clearTimeout(currentTimeout)
    }

    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', async () => {
      try {
        const { email, number } = JSON.parse(body)

        if (!validateInput(email, number)) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid input' }))
          return
        }

        currentTimeout = setTimeout(async () => {
          try {
            const filteredUsers = await searchUsers(email, number)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(filteredUsers))
          } catch (error) {
            console.error('Error during searchUsers:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Server Error' }))
          }
        }, 5000)
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
  }
}

const server = http.createServer(requestHandler)

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
