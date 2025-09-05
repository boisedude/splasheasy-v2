'use client'

import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

type AuthMode = 'login' | 'signup'

interface AuthModalProps {
  initialMode?: AuthMode
  onSuccess?: () => void
  onClose?: () => void
}

export function AuthModal({ initialMode = 'login', onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const handleSuccess = () => {
    onSuccess?.()
  }

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-8">
      <div className="w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToSignup={handleSwitchMode} />
        ) : (
          <SignupForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchMode} />
        )}

        {onClose && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Continue as guest
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
