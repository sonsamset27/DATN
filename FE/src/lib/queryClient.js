import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tránh call api liên tục khi focus tab
      retry: 1, // Chỉ thử lại 1 lần nếu lỗi
      staleTime: 5 * 60 * 1000, // Dữ liệu cache sống 5 phút
    },
  },
});
