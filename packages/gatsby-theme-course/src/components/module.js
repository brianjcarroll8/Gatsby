import React from 'react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from './layout';
import List from './list';
import PrevNext from './prev-next';
import ListHeader from "./list-header"
import Separator from "./separator"

const Module = ({ data: { module, lessons }, pageContext: { previous, next } }) => (
	<Layout currentModule={module.module}>
		<h1>{module.title}</h1>
		<MDXRenderer>{module.body}</MDXRenderer>
    <Separator />
		<ListHeader>List of lessons</ListHeader>
		<List items={lessons.nodes} />
		<PrevNext previous={previous} next={next} />
	</Layout>
);

export default Module;
