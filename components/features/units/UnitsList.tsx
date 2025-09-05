'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UnitForm } from './UnitForm'
import { useAuth } from '@/lib/auth-context'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Plus, Waves, Settings, Star, Trash2, Edit } from 'lucide-react'

interface Unit {
  id: string
  name: string
  type: 'pool' | 'spa' | 'hot_tub'
  volume_gallons: number
  sanitizer_type: 'chlorine' | 'bromine' | 'salt_water'
  is_favorite: boolean
  equipment_details: Record<string, unknown>
  created_at: string
  updated_at?: string
}

export function UnitsList() {
  const { user } = useAuth()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const fetchUnits = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setUnits(data || [])
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  const handleAddUnit = (unit: Unit) => {
    setUnits(prev => [unit, ...prev])
    setShowForm(false)
  }

  const handleUpdateUnit = (updatedUnit: Unit) => {
    setUnits(prev => prev.map(unit => (unit.id === updatedUnit.id ? updatedUnit : unit)))
    setEditingUnit(null)
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this unit? This will also delete all associated test results.'
      )
    ) {
      return
    }

    setDeleting(unitId)
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId)
        .eq('user_id', user?.id)

      if (error) throw error
      setUnits(prev => prev.filter(unit => unit.id !== unitId))
    } catch (error) {
      console.error('Error deleting unit:', error)
    } finally {
      setDeleting(null)
    }
  }

  const toggleFavorite = async (unit: Unit) => {
    try {
      const { error } = await supabase
        .from('units')
        .update({ is_favorite: !unit.is_favorite })
        .eq('id', unit.id)
        .eq('user_id', user?.id)

      if (error) throw error

      setUnits(prev =>
        prev
          .map(u => (u.id === unit.id ? { ...u, is_favorite: !u.is_favorite } : u))
          .sort((a, b) => {
            // Sort by favorite first, then by creation date
            if (a.is_favorite && !b.is_favorite) return -1
            if (!a.is_favorite && b.is_favorite) return 1
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'pool':
        return <Waves className="h-5 w-5" />
      case 'spa':
      case 'hot_tub':
        return <Settings className="h-4 w-4" />
      default:
        return <Waves className="h-5 w-5" />
    }
  }

  const formatSanitizerType = (type: string) => {
    switch (type) {
      case 'salt_water':
        return 'Salt Water'
      case 'chlorine':
        return 'Chlorine'
      case 'bromine':
        return 'Bromine'
      default:
        return type
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please sign in to manage your pools and spas
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showForm) {
    return <UnitForm onSuccess={handleAddUnit} onCancel={() => setShowForm(false)} />
  }

  if (editingUnit) {
    return (
      <UnitForm
        existingUnit={editingUnit}
        onSuccess={handleUpdateUnit}
        onCancel={() => setEditingUnit(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Pools & Spas</h2>
          <p className="text-muted-foreground">
            Manage your pool and spa information for personalized testing
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading your units...</div>
        </div>
      ) : units.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <Waves className="text-muted-foreground mx-auto h-12 w-12" />
              <div>
                <h3 className="text-lg font-semibold">No pools or spas yet</h3>
                <p className="text-muted-foreground">
                  Add your first pool or spa to start tracking water quality
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Unit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {units.map(unit => (
            <Card key={unit.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getUnitIcon(unit.type)}
                    <CardTitle className="text-lg">{unit.name}</CardTitle>
                    {unit.is_favorite && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(unit)}
                      className="h-8 w-8 p-0"
                    >
                      <Star
                        className={`h-4 w-4 ${unit.is_favorite ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUnit(unit)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUnit(unit.id)}
                      disabled={deleting === unit.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{unit.type.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volume:</span>
                  <span>{unit.volume_gallons.toLocaleString()} gal</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sanitizer:</span>
                  <span>{formatSanitizerType(unit.sanitizer_type)}</span>
                </div>

                {unit.equipment_details && (
                  <>
                    {unit.equipment_details.pump_type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pump:</span>
                        <span>{unit.equipment_details.pump_type as string}</span>
                      </div>
                    )}

                    {unit.equipment_details.filter_type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Filter:</span>
                        <span>{unit.equipment_details.filter_type as string}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
