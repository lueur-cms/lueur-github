import { rawPostsListUrl } from '../../constants'
import { PostSave } from '../../types/save'

export async function getPostsList() {
	return JSON.parse(await (await fetch(rawPostsListUrl)).text()) as PostSave[]
}
