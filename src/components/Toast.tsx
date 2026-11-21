import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'

export interface ToastMessage {
  id: string
  tone: 'success' | 'error' | 'info'
  title: string
  detail?: string
}

interface ToastContainerProps {
  toast: ToastMessage | null
  onClose: () => void
}

export function ToastContainer({ toast, onClose }: ToastContainerProps) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 3800)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const styles = {
    success: {
      bg: 'bg-slate-900 text-white border-emerald-500/30',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-red-950 text-white border-red-500/30',
      icon: <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900 text-white border-sky-500/30',
      icon: <Info className="h-5 w-5 text-sky-400 shrink-0" />,
    },
  }[toast.tone]

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 sm:w-96 animate-toast-in">
      <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${styles.bg}`}>
        {styles.icon}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">{toast.title}</p>
          {toast.detail && <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">{toast.detail}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
