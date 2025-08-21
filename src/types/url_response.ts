export type ContentResponseUrls = {
	GitUrl: GitUrl
	Url: Url
}

export type GitUrl = {
	/** The SHA of the latest commit to the file. */
	sha: string
	/** The id of the node. */
	node_id: string
	/** The size of the file in bytes. */
	size: number
	/** The URL of the file in the GitHub git interface. (i.e the url that give this response) */
	url: string
	/** The file contents encoded as base64. */
	content: string
	/** The encoding used to encode the file contents. */
	encoding: 'base64'
}

export type Url = {
	/** The name of the file. (e.g. hello-world.md) */
	name: string
	/** The path of the file from the ./(root) of the repository. (e.g. content/blog/hello-world.md) */
	path: string
	/** The SHA of the latest commit to the file. */
	sha: string
	/** The size of the file in bytes. */
	size: number
	/** The URL of the file in the GitHub API. (i.e the url that give this response) */
	url: string
	/** The URL of the file in the GitHub web interface. */
	html_url: string
	/** The URL of the file in the GitHub git interface. */
	git_url: string
	/** The URL of the raw file text contents (for Downloading the file). */
	download_url: string
	/** The type of the resource. (e.g. file for our case) */
	type: 'file'
	/** The encoded content of the file. */
	content: string
	/** The encoding used to encode the file contents. */
	encoding: 'base64'
	/** The various links to the file. */
	_links: {
		/** The URL of the file in the GitHub API. */
		self: string
		/** The URL of the file in the GitHub git interface. */
		git: string
		/** The URL of the file in the GitHub web interface. */
		html: string
	}
}

export type TreeUrl = {
	/** The SHA of the tree object. */
	sha: string
	/** The URL of the tree object in the GitHub API. */
	url: string
	/** The tree object. */
	tree: Array<{
		/** The path of the file. */
		path: string
		/** The mode of the file. */
		mode: string
		/** The type of the file. */
		type: 'tree' | 'blob'
		/** The SHA of the file. */
		sha: string
		/** The URL of the file in the GitHub API. */
		url: string
		/** The size of the file in bytes. */
		size?: number
		/** The URL of the blob object. (Only if type is blob) */
		content?: string
		/** The encoding used to encode the blob object. (Only if type is blob) */
		encoding?: string
	}>
	/** Whether the tree is truncated. */
	truncated: boolean
}
