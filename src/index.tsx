import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { PostsPage } from './app/posts'
import { PostPage } from './app/posts/[slug]'
import { getPostsList } from './functions/posts/get'
import { default as hub_config } from './github_config'
import { renderer } from './renderer'
import { PostType } from './types/post-type'
import { PostSave } from './types/save'

type Bindings = {
	GITHUB_BASE_API_URL: string
	GITHUB_TOKEN: string
}

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

/// Webhooks

/// API
// Save posts metadata
app.post('/api/posts/save', async (c) => {
	const { post }: { post: PostSave } = await c.req.json()
	const githubUrl = c.env.GITHUB_BASE_API_URL
	const file_path = `content/blog/posts-list.json`

	try {
		const listResponse = await getPostsList()
		const newList = listResponse.map((item) => {
			if (item.path === post.path) {
				return {
					...item,
					...post,
				}
			}
		})
		console.log(listResponse)

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
					message: 'Add or update post',
					content: btoa(JSON.stringify(newList, null, 2)),
					branch: hub_config.branch,
					commiter: hub_config.committer,
				}),
			}
		)

		if (response.ok) {
			const result = (await response.json()) as PostType
			return c.json({ post: result })
		} else {
			throw new Error('An error occured', { cause: JSON.stringify(response.json(), null, 2) })
		}
	} catch (error) {
		return c.json(c.error, 500)
	}
})

// Get all posts
app.get('/api/posts', (c: Context) => {
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

			{
				const savePost = await fetch('/api/posts/save', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						post: {
							download_url: result.content.download_url,
							sha: result.commit.sha,
							name: result.content.name,
							path: result.content.path,
							updated_at: result.commit.committer.date,
						} as PostSave,
					}),
				})
				if (!savePost.ok) {
					return c.json({ message: 'An error occured while saving post metadata' }, 500)
				}
			}
			return c.json({ post: result })
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
