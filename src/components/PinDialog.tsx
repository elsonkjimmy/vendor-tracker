import { Lock, X } from 'lucide-react'
import { useState } from 'react'

interface PinDialogProps {
  currentPin: string
  onSuccess: () => void
  onClose: () => void
}

export function PinDialog({ currentPin, onSuccess, onClose }: PinDialogProps) {
  const [pin, setPin] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit
      setPin(next)
      if (next.length === 4) {
        if (next === currentPin) {
          onSuccess()
        } else {
          setHasError(true)
          setTimeout(() => {
            setPin('')
            setHasError(false)
          }, 700)
        }
      }
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setHasError(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-up">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl text-center ring-1 ring-black/5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 shadow-inner">
          <Lock className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-black text-zinc-900">Espace Gérant</h3>
        <p className="mt-1 text-xs text-zinc-500 font-medium">Entrez votre code PIN à 4 chiffres</p>

        {/* 4 dots */}
        <div className="my-6 flex justify-center gap-3.5">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx
            return (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  hasError
                    ? 'bg-red-500 animate-bounce'
                    : filled
                      ? 'bg-zinc-900 scale-110 shadow-xs'
                      : 'bg-zinc-200'
                }`}
              />
            )
          })}
        </div>

        {hasError && <p className="mb-3 text-xs font-bold text-red-600 animate-fade-up">Code PIN incorrect</p>}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((val, idx) => {
            if (val === '') return <div key={idx} />
            if (val === '⌫') {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={handleDelete}
                  className="flex h-13 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-bold text-zinc-700 active:scale-95 hover:bg-zinc-200/70 transition"
                >
                  ⌫
                </button>
              )
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDigit(val)}
                className="flex h-13 items-center justify-center rounded-2xl bg-zinc-100 text-lg font-bold text-zinc-900 active:scale-95 hover:bg-zinc-200/70 transition"
              >
                {val}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
