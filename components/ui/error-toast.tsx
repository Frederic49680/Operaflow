"use client"

import { useEffect, useState } from "react"
import { XCircle, X } from "lucide-react"

interface ErrorToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export function ErrorToast({ message, onClose, duration = 4000 }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 10)
    
    // Fermeture automatique
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Attendre la fin de l'animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2">
      <div
        className={`
          bg-white rounded-lg shadow-2xl border border-red-200 p-4 min-w-[320px] max-w-md
          transition-all duration-300 ease-in-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

