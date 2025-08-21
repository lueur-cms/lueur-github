import { FC, PropsWithChildren } from 'hono/jsx'

export const PostPage: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div>
			<h1>Hello!</h1>
			{children}
		</div>
	)
}
