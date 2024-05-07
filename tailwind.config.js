const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
        './src/**/*.{vue,js,css}',
        './public/index.html',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Gotham Pro', ...defaultTheme.fontFamily.sans],
            },
        },
    },
};
