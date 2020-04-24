import React from 'react';
import { Heading } from 'theme-ui';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from './layout';
import List from './list';
import ListHeader from "./list-header"
import Separator from "./separator"

const Course = ({ data: { course, modules } }) => (
		<Layout>
			<Heading as="h1">{course.title}</Heading>
			<MDXRenderer>{course.body}</MDXRenderer>
      <Separator />
			<ListHeader>List of modules</ListHeader>
			<List items={modules.nodes} />
		</Layout>
	);

export default Course;
