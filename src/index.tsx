import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import blogPostConfig from '../content/content.schema'
import { PostsPage } from './app/posts'
import { PostPage } from './app/posts/[slug]'
import { default as hub_config } from './github_config'
import { MainLayout } from './layouts'
import { renderer } from './renderer'
import { PostType } from './types/post-type'
import { PostSave } from './types/save'

type Bindings = {
	GITHUB_BASE_API_URL: string
	GITHUB_TOKEN: string
	KV_STORAGE: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

/// Pages -  posts editing, new post, etc
// Render posts dashboard
app.get('/posts', (c) => {
	return c.render(<PostsPage>{JSON.stringify(blogPostConfig)}</PostsPage>)
})

// Get a specific post by slug (slug is the filename without extension)
app.get('/posts/:slug', async (c) => {
	const { slug } = c.req.param()
	const metadata = JSON.parse((await c.env.KV_STORAGE.get(`${slug}.md`)) as string) as PostSave

	return c.render(
		<MainLayout title="Lueur CMS" meta={[{ name: 'description', content: 'Lueur CMS' }]}>
			<PostPage metadata={metadata} slug={slug} />
		</MainLayout>
	)
})

// Get KV
app.get('/api/kv/:key', async (c) => {
	const { key } = c.req.param()
	const metadata = await c.env.KV_STORAGE.get(key)
	if (metadata !== null) {
		return c.json(JSON.parse(metadata!), 200)
	} else {
		return c.json(null, 404)
	}
})

/// Webhooks

/// API
// Save posts metadata
// ...

// Get all posts
app.get('/api/posts', (c) => {
	return c.json({ posts: [] })
})

/// CRUD
// 1. READ
// Get a specific post by slug (slug is the filename without extension)
app.get('/api/posts/:slug', async (c) => {
	const { slug } = c.req.param()

	if (!slug) {
		return c.json({ error: 'Missing either required param slug' })
	}

	try {
		const { download_url } = JSON.parse(
			(await c.env.KV_STORAGE.get(`${slug}.md`)) as string
		) as PostSave

		const response = await fetch(download_url, { method: 'GET' })

		if (response.ok) {
			// The actual text of the markdoc file
			const content = await response.text()
			return c.json({ content }, 200)
		} else {
			return c.json({ error: 'An error occured' }, response.status as ContentfulStatusCode)
		}
	} catch (error) {
		console.error(error)
		return c.json({ error }, 500)
	}
})

// 2. CREATE
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

			// Send the post metadata to KV storage webhook
			try {
				await c.env.KV_STORAGE.put(
					`${result.content.name}`,
					JSON.stringify({
						download_url: result.content.download_url,
						sha: result.content.sha,
						name: result.content.name,
						path: result.content.path,
						updated_at: result.commit.committer.date,
					} as PostSave)
				)
			} catch (error) {
				console.error(error)
			}
			return c.json(result, 201)
		} else {
			throw new Error('An error occured', { cause: JSON.stringify(response.json(), null, 2) })
		}
	} catch (error) {
		return c.json(c.error, 500)
	}
})

// 3. UPDATE
// Update a post by slug (slug is the filename without extension)
app.put('/api/posts/:slug/update', async (c) => {
	const { slug } = c.req.param()
	const { message, content } = await c.req.json()

	if (!slug) {
		return c.json({ error: 'Missing either required params repo, owner, or slug' })
	}

	const githubUrl = c.env.GITHUB_BASE_API_URL
	const file_path = `content/blog/${slug}.md`

	const { sha: previous_sha }: PostSave = JSON.parse(
		(await c.env.KV_STORAGE.get(`${slug}.md`)) as string
	)
	console.log(previous_sha)

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
					sha: previous_sha,
				}),
			}
		)

		if (response.ok) {
			const result = (await response.json()) as PostType

			// Send the post metadata to KV storage webhook
			try {
				await c.env.KV_STORAGE.put(
					`${result.content.name}`, //-${values.keys.length + 1}`,
					JSON.stringify({
						download_url: result.content.download_url,
						sha: result.content.sha,
						name: result.content.name,
						path: result.content.path,
						updated_at: result.commit.committer.date,
					} as PostSave)
				)
			} catch (error) {
				console.error(error)
			}
			return c.json(result, 200)
		} else {
			throw new Error('An error occured', { cause: JSON.stringify(response.json(), null, 2) })
		}
	} catch (error) {
		return c.json({ error }, 500)
	}
})

// 4. DELETE
// Delete a post by slug (slug is the filename without extension)
app.delete('/api/posts/:slug/delete', async (c) => {
	const { slug } = c.req.param()
	const { message } = await c.req.json()

	if (!slug) {
		return c.json({ error: 'Missing either required params repo, owner, or slug' })
	}

	const githubUrl = c.env.GITHUB_BASE_API_URL
	const file_path = `content/blog/${slug}.md`

	const { sha: previous_sha }: PostSave = JSON.parse(
		(await c.env.KV_STORAGE.get(`${slug}.md`)) as string
	)

	try {
		const response = await fetch(
			`${githubUrl}/repos/${hub_config.owner}/${hub_config.repo}/contents/${file_path}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${c.env.GITHUB_TOKEN}`,
					Accept: 'application/vnd.github.v3+json',
					'Content-Type': 'application/json',
					'X-GitHub-Api-Version': '2022-11-28',
					'User-Agent': 'lueur-cms',
				},
				body: JSON.stringify({
					message: message,
					branch: hub_config.branch,
					commiter: hub_config.committer,
					sha: previous_sha,
				}),
			}
		)

		try {
			await c.env.KV_STORAGE.delete(`${slug}.md`)
		} catch (error) {
			console.error(error)
		}

		if (response.ok) {
			const result = (await response.json()) as PostType
			return c.json(result, 200)
		} else {
			throw new Error('An error occured', { cause: JSON.stringify(response.json(), null, 2) })
		}
	} catch (error) {
		return c.json({ error }, 500)
	}
})

/// Export
export default app
