import { PostType } from '../../types/post-type'

export async function addPostToList(post: PostType) {
	const response = await fetch('', {
		method: 'POST',
	})
	return []
}
