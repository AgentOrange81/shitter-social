"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "info" | "success" | "error"
}

interface ToastOptions {
  title: string
  description?: string
  type?: "info" | "success" | "error"
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const { title, description, type = "info" } = options
    const id = `toast_${Date.now()}`
    const message = description ? `${title}: ${description}` : title
    setToasts((prev) => [...prev, { id, title, description, type }])
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-bottom-4 fade-in duration-200 ${
              t.type === "error" 
                ? "bg-red-600" 
                : t.type === "success"
                ? "bg-green-600"
                : "bg-shit-dark border border-shit text-cream"
            }`}
          >
            <div className="font-bold">{t.title}</div>
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return a no-op if used outside provider
    return { toast: (_options: ToastOptions) => {} }
  }
  return context
}