import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from 'react-query'

import { router } from '@/router'
import { queryClient } from '@/queryClient'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

import './global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vgs-theme">
        <>
          <Toaster />
          <RouterProvider router={router} />
        </>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
