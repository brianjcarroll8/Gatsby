/** @jsx jsx */
import { jsx, Flex, Link as TLink } from 'theme-ui';
import { useState, useRef } from 'react';
import { Link } from 'gatsby';

const MenuToggle = ({ title = '', slug = '', items = [], expandByDefault = false }) => {
	const [isExpanded, setExpanded] = useState(expandByDefault);
	const toggleRef = useRef(null);
	const itemListRef = useRef(null);
	const clickHandler = () => {
		setExpanded(!isExpanded);
		if (isExpanded) {
			itemListRef.current.querySelector('a').focus();
		}
	};

	return (
		<div>
			<button aria-controls={`#${title}-menu`} onClick={clickHandler} ref={toggleRef} aria-expanded={isExpanded}>
				{title}
			</button>
			<ul
				id={`#${title}-menu`}
				ref={itemListRef}
				tabIndex={-1}
				className={`${isExpanded ? 'expanded' : ''}`}
				role="list"
				sx={{
					display: 'none',
					'&.expanded': {
						display: 'block',
					},
				}}
			>
				<li>
					<TLink as={Link} to={slug} role="listitem" class="item-link">
						{title} Overview
					</TLink>
				</li>
				{items.map(item => (
					<li key={item.title} role="listitem">
						<TLink as={Link} to={item.slug}>
							{item.title}
						</TLink>
					</li>
				))}
			</ul>
		</div>
	);
};

export default MenuToggle;
