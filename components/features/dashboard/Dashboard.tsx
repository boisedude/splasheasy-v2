'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Calendar, Activity, Waves, AlertCircle, CheckCircle, Clock, BarChart3 } from 'lucide-react'

interface TestResult {
  id: string
  unit_id: string
  ph: number | null
  free_chlorine: number | null
  total_alkalinity: number | null
  confidence_score: number | null
  created_at: string
  units: {
    name: string
    type: string
  }
}

interface DashboardStats {
  totalTests: number
  recentTests: TestResult[]
  needsAttention: number
  avgConfidence: number
  lastTestDate: string | null
}

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    recentTests: [],
    needsAttention: 0,
    avgConfidence: 0,
    lastTestDate: null,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createSupabaseBrowserClient()

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      // Get recent test results with unit info
      const { data: recentTests, error: testsError } = await supabase
        .from('water_tests')
        .select(
          `
          *,
          units (
            name,
            type
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (testsError) throw testsError

      // Get total test count
      const { count: totalTests, error: countError } = await supabase
        .from('water_tests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) throw countError

      // Calculate stats
      const needsAttention =
        recentTests?.filter(test => {
          const phOutOfRange = test.ph && (test.ph < 7.2 || test.ph > 7.6)
          const chlorineOutOfRange =
            test.free_chlorine && (test.free_chlorine < 1.0 || test.free_chlorine > 3.0)
          const alkalinityOutOfRange =
            test.total_alkalinity && (test.total_alkalinity < 80 || test.total_alkalinity > 120)

          return phOutOfRange || chlorineOutOfRange || alkalinityOutOfRange
        }).length || 0

      const avgConfidence = recentTests?.length
        ? recentTests
            .filter(test => test.confidence_score !== null)
            .reduce((sum, test) => sum + (test.confidence_score || 0), 0) / recentTests.length
        : 0

      const lastTestDate = recentTests?.[0]?.created_at || null

      setStats({
        totalTests: totalTests || 0,
        recentTests: recentTests || [],
        needsAttention,
        avgConfidence,
        lastTestDate,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getParameterStatus = (value: number | null, min: number, max: number) => {
    if (value === null) return 'unknown'
    if (value < min || value > max) return 'warning'
    return 'good'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return 'N/A'
    return `${value.toFixed(1)}${unit}`
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Please sign in to view your dashboard</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="mb-2 h-4 rounded bg-gray-200"></div>
                  <div className="h-8 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.user_metadata?.first_name || 'there'}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your pool testing overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-muted-foreground text-sm">Total Tests</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-muted-foreground text-sm">Needs Attention</p>
                <p className="text-2xl font-bold">{stats.needsAttention}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-muted-foreground text-sm">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {stats.avgConfidence > 0 ? `${Math.round(stats.avgConfidence * 100)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-muted-foreground text-sm">Last Test</p>
                <p className="text-lg font-semibold">
                  {stats.lastTestDate ? formatDate(stats.lastTestDate).split(',')[0] : 'None yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5" />
            Recent Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTests.length === 0 ? (
            <div className="py-8 text-center">
              <Waves className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No tests yet</h3>
              <p className="text-muted-foreground mb-4">
                Start testing your pool water to see results here
              </p>
              <Button>Take Your First Test</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentTests.slice(0, 5).map(test => (
                <div
                  key={test.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Waves className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{test.units.name}</h4>
                      <p className="text-muted-foreground text-sm">{formatDate(test.created_at)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(getParameterStatus(test.ph, 7.2, 7.6))}
                      <span>pH: {formatValue(test.ph, '')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(getParameterStatus(test.free_chlorine, 1.0, 3.0))}
                      <span>Cl: {formatValue(test.free_chlorine, 'ppm')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(getParameterStatus(test.total_alkalinity, 80, 120))}
                      <span>TA: {formatValue(test.total_alkalinity, 'ppm')}</span>
                    </div>
                  </div>

                  {test.confidence_score && (
                    <div className="text-right">
                      <div className="text-muted-foreground text-sm">Confidence</div>
                      <div className="font-semibold">
                        {Math.round(test.confidence_score * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {stats.recentTests.length > 5 && (
                <div className="pt-4 text-center">
                  <Button variant="outline">View All Tests</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
