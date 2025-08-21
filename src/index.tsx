import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)
app.use('/api/*', cors())

/// Pages -  posts editing, new post, etc
// Render dashboard
app.get('/', (c) => {
	return c.render(<h1>Hello!</h1>)
})

/// Webhooks

/// API
// Get all posts
app.get('/api/posts', (c) => {})

// Get a specific post by slug (slug is the filename without extension)
app.get('/api/posts/:slug', (c) => {})

// Create a new post named {$slug}.{md|mdoc}
app.post('/api/posts/:slug/create', (c) => {})

// Update a post by slug (slug is the filename without extension)
app.put('/api/posts/:slug/update', (c) => {})

// Delete a post by slug (slug is the filename without extension)
app.delete('/api/posts/:slug/delete', (c) => {})

/// Export
export default app
