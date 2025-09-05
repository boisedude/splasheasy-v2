'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/features/auth/AuthModal'
import { Dashboard } from '@/components/features/dashboard/Dashboard'
import { UnitsList } from '@/components/features/units/UnitsList'
import { ProfileForm } from '@/components/features/profile/ProfileForm'
import { Droplets, User, Waves, LogOut, Menu, X, Home, TestTube } from 'lucide-react'

type AppView = 'guest' | 'dashboard' | 'units' | 'profile' | 'test'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut, loading } = useAuth()
  const [currentView, setCurrentView] = useState<AppView>('guest')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // If loading, show a simple loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user and not showing auth modal, show guest content (original homepage)
  if (!user && !showAuthModal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Guest Navigation */}
        <nav className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">SplashEasy V2</span>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
                <Button onClick={() => setShowAuthModal(true)}>Get Started</Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Guest Content */}
        {children}
      </div>
    )
  }

  // Show auth modal
  if (showAuthModal) {
    return (
      <AuthModal
        onSuccess={() => {
          setShowAuthModal(false)
          setCurrentView('dashboard')
        }}
        onClose={() => setShowAuthModal(false)}
      />
    )
  }

  // Authenticated user interface
  const handleSignOut = async () => {
    await signOut()
    setCurrentView('guest')
    setMobileMenuOpen(false)
  }

  const navigation = [
    { key: 'dashboard', icon: Home, label: 'Dashboard' },
    { key: 'test', icon: TestTube, label: 'Take Test' },
    { key: 'units', icon: Waves, label: 'My Pools' },
    { key: 'profile', icon: User, label: 'Profile' },
  ]

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'units':
        return <UnitsList />
      case 'profile':
        return <ProfileForm />
      case 'test':
        return children
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Droplets className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SplashEasy V2</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 md:flex">
              {navigation.map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key as AppView)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    currentView === item.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="space-y-2 border-t py-4 md:hidden">
              {navigation.map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCurrentView(item.key as AppView)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    currentView === item.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  )
}
