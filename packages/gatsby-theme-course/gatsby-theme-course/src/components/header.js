/** @jsx jsx */
import { jsx, Link as TLink } from 'theme-ui';
import { Link, useStaticQuery, graphql } from 'gatsby';

const Header = () => {
	const data = useStaticQuery(graphql`
		{
			site {
				siteMetadata {
					title
				}
			}
		}
	`);

	return (
		<header
			sx={{
				display: 'flex',
				alignItems: 'center',
				variant: 'styles.header',
			}}
		>
			<TLink
				as={Link}
				to="/"
				sx={{
					variant: 'styles.navlink',
					p: 2,
				}}
			>
				{data.site.siteMetadata.title}
			</TLink>
			<div sx={{ mx: 'auto' }} />
			<TLink
				href="https://google.com"
				sx={{
					variant: 'styles.navlink',
					p: 2,
				}}
			>
				Google
			</TLink>
		</header>
	);
};

export default Header;
