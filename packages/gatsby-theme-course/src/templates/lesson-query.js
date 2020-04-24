import { graphql } from 'gatsby';
import LessonPage from '../components/lesson';

export default LessonPage;

export const query = graphql`
	query LessonPageQuery($id: String!, $module: Int!) {
		lesson: mdxLesson(id: { eq: $id }) {
			id
			slug
			title
			module
			number: lesson
			body
		}
		module: mdxModule(module: { eq: $module }) {
			title
			description
		}
	}
`;
