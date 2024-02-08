import checker from 'vite-plugin-checker'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    checker({
      typescript: true,
    }),
  ],
}
