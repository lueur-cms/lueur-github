import { FC } from 'hono/jsx'
import { PostSave } from '../../types/save'

export const PostPage: FC<{ metadata: PostSave | null }> = ({ metadata }) => {
	console.log(metadata)
	return (
		<div>
			<h1>{metadata?.name}</h1>
			<pre>{JSON.stringify(metadata, null, 2)}</pre>
			<div>
				<table>
					<thead>
						<tr>
							{Object.keys(metadata!).map((key) => (
								<th>{key}</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr>
							{Object.values(metadata!).map((value) => (
								<td>{value}</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}
