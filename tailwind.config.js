const svgToDataUri = require("mini-svg-data-uri");

// Vendored equivalent of the old tailwindcss/lib/util/flattenColorPalette
// helper (removed from the package internals in Tailwind v4) — flattens a
// nested color object like { blue: { 500: '#...' } } into { 'blue-500': '#...' }.
function flattenColorPalette(colors) {
	return Object.assign(
		{},
		...Object.entries(colors ?? {}).flatMap(([color, values]) =>
			typeof values === "object"
				? Object.entries(values).map(([key, value]) => ({
						[`${color}-${key}`]: value,
					}))
				: [{ [color]: values }]
		)
	);
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{ts,tsx}"],
	darkMode: ["class", "class"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Satoshi', 'sans-serif'],
				satoshi: ['Satoshi', 'sans-serif'],
				urbanist: ['Satoshi', 'sans-serif'], // fallback for existing classes
			},
			// Color tokens (background, primary, sidebar, etc.) are now defined
			// natively in src/index.css via an `@theme` block instead of here —
			// Tailwind v4's CSS-first theme lets the dashboard override the
			// underlying CSS variables per-scope (see .dashboard-root) without
			// needing a second Tailwind config.
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.2s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			}
		}
	},
	plugins: [
		addVariablesForColors,
		function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					"bg-dot-thick": (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
						)}")`,
					}),
				},
				{ values: flattenColorPalette(theme("backgroundColor")), type: "color" }
			);
		},
	],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
	let allColors = flattenColorPalette(theme("colors"));
	let newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
	);

	addBase({
		":root": newVars,
	});
}
