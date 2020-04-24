module.exports = themeOptions => {
	const basePath = themeOptions.basePath || `/`;
	const coursePath = themeOptions.coursePath || `content/course`;
	const assetPath = themeOptions.assetPath || `content/assets`;

	return {
		basePath,
		coursePath,
		assetPath,
	};
};
