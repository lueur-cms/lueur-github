import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PostsPage } from './app/posts'
import { PostPage } from './app/posts/[slug]'
import { default as hub_config } from './github_config'
import { renderer } from './renderer'
import { PostType } from './types/post-type'
import { PostSave } from './types/save'

type Bindings = {
	GITHUB_BASE_API_URL: string
	GITHUB_TOKEN: string
	KV_STORAGE: KVNamespace
}
let listSha = 'dfd246f502d15fc73ad1b7d9a1566c62a7acf10a'

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

/// Pages -  posts editing, new post, etc
// Render posts dashboard
app.get('/posts', (c) => {
	return c.render(<PostsPage>hello</PostsPage>)
})

// Get a specific post by slug (slug is the filename without extension)
app.get('/posts/:slug', (c) => {
	return c.render(<PostPage>hello</PostPage>)
})

// Get KV
app.get('/api/kv/:key', async (c) => {
	const { key } = c.req.param()
	const value = await c.env.KV_STORAGE.get(key)
	return c.json({ value })
})

/// Webhooks
app.post('/api/webhook/kv', async (c) => {
	const { post }: { post: PostType } = await c.req.json()

	try {
		await c.env.KV_STORAGE.put(
			post.content.name,
			JSON.stringify({
				download_url: post.content.download_url,
				sha: post.commit.sha,
				name: post.content.name,
				path: post.content.path,
				updated_at: post.commit.committer.date,
			} as PostSave)
		)
		return c.json({ message: 'Post metadata saved to KV storage' }, 201)
	} catch (error) {
		console.error(error)
		return c.json({ message: 'An error occured while saving post metadata' }, 500)
	}
})

/// API
// Save posts metadata
// ...

// Get all posts
app.get('/api/posts', (c) => {
	return c.json({ posts: [] })
})

// Get a specific post by slug (slug is the filename without extension)
app.get('/api/posts/:slug', async (c) => {
	const { slug } = c.req.param()

	if (!slug) {
		return c.json({ error: 'Missing either required param slug' })
	}

	const githubUrl = c.env.GITHUB_BASE_API_URL
	const file_path = `/contents/posts/${slug}.md`

	return c.json({ post: {} })
})

// Create a new post named {$slug}.{md|mdoc}
app.post('/api/posts/:slug/create', async (c) => {
	const { slug } = c.req.param()
	const { message, content } = await c.req.json()

	if (!slug) {
		return c.json({ error: 'Missing either required params repo, owner, or slug' })
	}

	const githubUrl = c.env.GITHUB_BASE_API_URL
	const file_path = `content/blog/${slug}.md`

	try {
		const response = await fetch(
			`${githubUrl}/repos/${hub_config.owner}/${hub_config.repo}/contents/${file_path}`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${c.env.GITHUB_TOKEN}`,
					Accept: 'application/vnd.github.v3+json',
					'Content-Type': 'application/json',
					'X-GitHub-Api-Version': '2022-11-28',
					'User-Agent': 'lueur-cms',
				},
				body: JSON.stringify({
					message: message,
					content: btoa(content),
					branch: hub_config.branch,
					commiter: hub_config.committer,
				}),
			}
		)

		if (response.ok) {
			const result = (await response.json()) as PostType

			console.log(result)

			// Send the post metadata to KV storage webhook
			try {
				await c.env.KV_STORAGE.put(
					`${result.content.name}`,
					JSON.stringify({
						download_url: result.content.download_url,
						sha: result.commit.sha,
						name: result.content.name,
						path: result.content.path,
						updated_at: result.commit.committer.date,
					} as PostSave)
				)
				return c.json({ message: 'Post metadata saved to KV storage' }, 201)
			} catch (error) {
				console.error(error)
				return c.json({ message: 'An error occured while saving post metadata' }, 500)
			}
			return c.json(result)
		} else {
			throw new Error('An error occured', { cause: JSON.stringify(response.json(), null, 2) })
		}
	} catch (error) {
		return c.json(c.error, 500)
	}
})

// Update a post by slug (slug is the filename without extension)
app.put('/api/posts/:slug/update', (c) => {
	return c.json({ post: {} })
})

// Delete a post by slug (slug is the filename without extension)
app.delete('/api/posts/:slug/delete', (c) => {
	return c.json({ post: {} })
})

/// Export
export default app
