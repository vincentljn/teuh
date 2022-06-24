module.exports = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 2,
	singleQuote: true,
	semi: false,
	endOfLine: 'lf',
	trailingComma: 'es5',
	bracketSpacing: true,
	overrides: [
		{
			files: './**/*.{js,ts,jsx,tsx}',
			options: {
				parser: 'babel-ts',
			},
		},
		{
			files: './**/*.json',
			options: {
				parser: 'json',
			},
		},
		{
			files: './*.json',
			options: {
				parser: 'json',
			},
		},
		{
			files: '.*.rc',
			options: {
				parser: 'json',
			},
		},
	],
}
