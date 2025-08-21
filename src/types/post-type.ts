import { ContentResponseUrls } from './url_response'

export type PostType = {
	/** The file metadata content. */
	content: ContentResponseUrls['Url']
	commit: {
		/** The SHA of the latest commit to the repository. */
		sha: string
		/** The id of the node. */
		node_id: string
		/**
		 * The URL of the commit in the GitHub API.
		 * @returns {PostType['commit']} The commit object.
		 * */
		url: string
		/** The URL of this commit in the GitHub web interface. */
		html_url: string
		/** The author of the commit. */
		author: {
			/** The username of the author commiting the file. */
			name: string
			/** The email of the author commiting the file. */
			email: string
			/** The date of the author commiting the file. */
			date: string
		}
		/** The committer of the commit. */
		committer: {
			/** The username of the committer commiting the file. */
			name: string
			/** The email of the committer commiting the file. */
			email: string
			/** The date of the committer commiting the file. */
			date: string
		}
		/** The tree object of the commit. */
		tree: {
			/** The SHA of the tree object. */
			sha: string
			/**
			 * The URL of the tree object in the GitHub API.
			 * @return {ContentResponseUrls['TreeUrl']} The tree object.
			 * */
			url: string
		}
		/** The message of the commit. */
		message: string
		/** The parents of the commit. */
		parents: Array<{
			/** The SHA of the parent commit. */
			sha: string
			/** The URL of the parent commit in the GitHub API. */
			url: string
			/** The URL of the parent commit in the GitHub web interface. */
			html_url: string
		}>
		/** The verification object of the commit. */
		verification: {
			/** The verification status of the commit. */
			verified: boolean
			/** The reason why the commit was verified. */
			reason: string
			/** The signature of the commit. */
			signature: string | null
			/** The payload of the commit. */
			payload: string | null
			/** The date the commit was verified. */
			verified_at: string | null
		}
	}
}
