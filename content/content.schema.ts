import BlogSchemaJSON from './blog/blogSchema.json' assert { type: 'json' }
import { defineConfig } from './define'

export type BlogSchema = typeof BlogSchemaJSON

export type BlogPost = BlogSchema['definitions']['blogPost']['fields']

export const blogPostConfig = BlogSchemaJSON['definitions']['blogPost']['fields'].map((field) => ({
	name: field['__name'],
	description: field['_description'],
	type: field['_type'],
	default: field['default'],
	long: field['long'],
	required: field['required'],
	validations: field['validations'],
}))

export type BlogConfig = typeof blogPostConfig

export default defineConfig({
	blogpost: blogPostConfig,
})
