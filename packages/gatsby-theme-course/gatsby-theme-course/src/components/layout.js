/** @jsx jsx */
import { jsx, Container } from 'theme-ui';
import SEO from './seo';
import Header from './header';
import Footer from './footer';
import CourseNav from './course-nav';

const Layout = ({ children, currentModule = 0 }) => {
	return (
		<Container>
			<SEO />
			<Header />
			<CourseNav currentModule={currentModule} />
			<main>{children}</main>
			<Footer />
		</Container>
	);
};

export default Layout;
