'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { AlertCircle, Plus } from 'lucide-react'

interface UnitData {
  name: string
  type: 'pool' | 'spa' | 'hot_tub'
  volume_gallons: number
  sanitizer_type: 'chlorine' | 'bromine' | 'salt_water'
  equipment_details: {
    pump_type?: string
    filter_type?: string
    heater?: boolean
    cover?: boolean
  }
}

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

interface UnitFormProps {
  onSuccess?: (unit: Unit) => void
  onCancel?: () => void
  existingUnit?: Unit
}

export function UnitForm({ onSuccess, onCancel, existingUnit }: UnitFormProps) {
  const { user } = useAuth()
  const [unitData, setUnitData] = useState<UnitData>({
    name: existingUnit?.name || '',
    type: existingUnit?.type || 'pool',
    volume_gallons: existingUnit?.volume_gallons || 0,
    sanitizer_type: existingUnit?.sanitizer_type || 'chlorine',
    equipment_details: {
      pump_type: (existingUnit?.equipment_details?.pump_type as string) || '',
      filter_type: (existingUnit?.equipment_details?.filter_type as string) || '',
      heater: (existingUnit?.equipment_details?.heater as boolean) || false,
      cover: (existingUnit?.equipment_details?.cover as boolean) || false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const unitPayload = {
        name: unitData.name,
        type: unitData.type,
        volume_gallons: unitData.volume_gallons,
        sanitizer_type: unitData.sanitizer_type,
        equipment_details: unitData.equipment_details,
        user_id: user.id,
        is_favorite: !existingUnit, // New units default to favorite
      }

      let result
      if (existingUnit) {
        // Update existing unit
        result = await supabase
          .from('units')
          .update(unitPayload)
          .eq('id', existingUnit.id)
          .eq('user_id', user.id)
          .select()
          .single()
      } else {
        // Create new unit
        result = await supabase.from('units').insert(unitPayload).select().single()
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onSuccess?.(result.data)
      }
    } catch {
      setError('Failed to save unit')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UnitData, value: string | number | boolean) => {
    setUnitData(prev => ({ ...prev, [field]: value }))
  }

  const handleEquipmentChange = (field: string, value: string | boolean) => {
    setUnitData(prev => ({
      ...prev,
      equipment_details: {
        ...prev.equipment_details,
        [field]: value,
      },
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {existingUnit ? 'Edit' : 'Add New'} Pool/Spa
        </CardTitle>
        <CardDescription>
          {existingUnit
            ? 'Update your pool or spa information'
            : 'Add a new pool or spa to track its water quality'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name *
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Pool, Backyard Spa"
                value={unitData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type *
              </label>
              <Select
                value={unitData.type}
                onValueChange={(value: 'pool' | 'spa' | 'hot_tub') =>
                  handleInputChange('type', value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pool">Pool</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="hot_tub">Hot Tub</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="volume" className="text-sm font-medium">
                Volume (gallons) *
              </label>
              <Input
                id="volume"
                type="number"
                min="0"
                placeholder="e.g., 15000"
                value={unitData.volume_gallons || ''}
                onChange={e => handleInputChange('volume_gallons', parseInt(e.target.value) || 0)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sanitizer" className="text-sm font-medium">
                Sanitizer Type *
              </label>
              <Select
                value={unitData.sanitizer_type}
                onValueChange={(value: 'chlorine' | 'bromine' | 'salt_water') =>
                  handleInputChange('sanitizer_type', value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sanitizer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chlorine">Chlorine</SelectItem>
                  <SelectItem value="bromine">Bromine</SelectItem>
                  <SelectItem value="salt_water">Salt Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Equipment Details (Optional)</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="pumpType" className="text-sm font-medium">
                  Pump Type
                </label>
                <Input
                  id="pumpType"
                  placeholder="e.g., Variable Speed, Single Speed"
                  value={unitData.equipment_details.pump_type || ''}
                  onChange={e => handleEquipmentChange('pump_type', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="filterType" className="text-sm font-medium">
                  Filter Type
                </label>
                <Input
                  id="filterType"
                  placeholder="e.g., Sand, Cartridge, DE"
                  value={unitData.equipment_details.filter_type || ''}
                  onChange={e => handleEquipmentChange('filter_type', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={unitData.equipment_details.heater}
                  onChange={e => handleEquipmentChange('heater', e.target.checked)}
                  disabled={loading}
                  className="border-input rounded"
                />
                Has Heater
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={unitData.equipment_details.cover}
                  onChange={e => handleEquipmentChange('cover', e.target.checked)}
                  disabled={loading}
                  className="border-input rounded"
                />
                Has Cover
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading
              ? existingUnit
                ? 'Updating...'
                : 'Adding...'
              : existingUnit
                ? 'Update Unit'
                : 'Add Unit'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
