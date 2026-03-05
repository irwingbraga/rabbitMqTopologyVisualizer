/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        exchange: {
          direct: { bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a' },
          fanout: { bg: '#dcfce7', border: '#16a34a', text: '#14532d' },
          topic: { bg: '#f3e8ff', border: '#7c3aed', text: '#3b0764' },
          headers: { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12' },
          default: { bg: '#f1f5f9', border: '#64748b', text: '#1e293b' },
        },
      },
    },
  },
  plugins: [],
}
