import { BlogConfig } from './content.schema'

export function defineConfig({ blogpost }: { blogpost: BlogConfig }) {
	return {
		blogpost,
	}
}
