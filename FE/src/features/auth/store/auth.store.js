import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null, // { id, walletAddress, role, status, userName }
      accessToken: null,
      
      login: (userData, token) => {
        localStorage.setItem('accessToken', token);
        set({ isAuthenticated: true, user: userData, accessToken: token });
      },
      
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ isAuthenticated: false, user: null, accessToken: null });
      },
      
      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      }
    }),
    {
      name: 'auth-storage',
      // Không lưu accessToken vào persisted state để bảo mật hơn (đã lưu ở localStorage tay nếu cần)
      // Nhưng dùng zustand persist tiện lợi. Nếu cần, ta bỏ persist token.
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user 
      }),
    }
  )
);
