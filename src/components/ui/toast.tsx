"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface Toast {
  id: string
  message: string
  type: "info" | "success" | "error"
}

interface ToastContextType {
  showToast: (message: string, type?: "info" | "success" | "error") => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: "info" | "success" | "error" = "info") => {
    const id = `toast_${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-bottom-4 fade-in duration-200 ${
              toast.type === "error" 
                ? "bg-red-600" 
                : toast.type === "success"
                ? "bg-green-600"
                : "bg-shit-dark border border-shit text-cream"
            }`}
          >
            {toast.message}
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
    return { showToast: (_message: string, _type?: "info" | "success" | "error") => {} }
  }
  return context
}