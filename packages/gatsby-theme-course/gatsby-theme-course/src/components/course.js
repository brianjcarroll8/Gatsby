import React from 'react';
import { Heading } from 'theme-ui';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from './layout';
import List from './list';

const Course = ({ data: { course, modules } }) => {
	return (
		<Layout>
			<Heading as="h1">{course.title}</Heading>
			<MDXRenderer>{course.body}</MDXRenderer>
			<Heading>List of modules:</Heading>
			<List items={modules.nodes} />
		</Layout>
	);
};

export default Course;
