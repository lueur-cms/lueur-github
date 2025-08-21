import { FC, PropsWithChildren } from 'hono/jsx'

type Meta = {
	name: string
	content: string
}

type Title = string | ((title: string) => string)

const defaultMeta: Meta[] = [
	{
		name: 'description',
		content: 'Lueur CMS',
	},
	{
		name: 'author',
		content: 'Lazaro Osee',
	},
	{
		name: 'generator',
		content: 'Hono',
	},
	{
		name: 'viewport',
		content: 'width=device-width, initial-scale=1.0',
	},
]

export const MainLayout: FC<PropsWithChildren<{ meta: Meta[]; title: Title }>> = ({
	children,
	meta,
	title,
}) => {
	return (
		<html>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="author" content="Lazaro Osee" />
				<meta name="generator" content="Hono" />
				{meta.map(({ name, content }) => (
					<meta name={name} content={content} />
				))}
				<title>{title}</title>
				<link href="/static/style.css" rel="stylesheet" />
				<script src="/static/script.js" type="module" defer></script>
			</head>
			<body>{children}</body>
		</html>
	)
}
