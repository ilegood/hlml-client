import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const addFriendModalJsx = {
  name: 'add-friend-modal-jsx',
  enforce: 'pre',
  transform(code, id) {
    if (
      id.endsWith('/src/hooks/friend/AddFriendModal.js') ||
      id.endsWith('/src/hooks/friend/AppointmentModal.js') ||
      id.endsWith('/src/hooks/friend/BlockedListModal.js') ||
      id.endsWith('/src/hooks/ChatMembersModal.js') ||
      id.endsWith('/src/hooks/CategorySelector.js')
      || id.endsWith('/src/hooks/PostCard.js')
    ) {
      return transformWithOxc(code, id, { lang: 'jsx' })
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [addFriendModalJsx, react(), tailwindcss()],
  optimizeDeps: {
    include: ["emoji-mart", "@emoji-mart/react", "@emoji-mart/data"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
})
