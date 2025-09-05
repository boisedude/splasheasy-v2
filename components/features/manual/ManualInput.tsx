'use client'

import { useState, useCallback } from 'react'
import { Check, X, Calculator, Droplets } from 'lucide-react'

interface ManualInputProps {
  onResultsSubmit: (results: ManualTestResults) => void
  onCancel?: () => void
  className?: string
}

export interface ManualTestResults {
  ph: number | null
  chlorine: number | null
  alkalinity: number | null
  hardness: number | null
  cyanuricAcid: number | null
  bromine: number | null
  notes?: string
}

export default function ManualInput({
  onResultsSubmit,
  onCancel,
  className = '',
}: ManualInputProps) {
  const [results, setResults] = useState<ManualTestResults>({
    ph: null,
    chlorine: null,
    alkalinity: null,
    hardness: null,
    cyanuricAcid: null,
    bromine: null,
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateResult = useCallback((field: keyof ManualTestResults, value: string) => {
    if (field === 'notes') {
      setResults(prev => ({ ...prev, notes: value }))
    } else {
      const numValue = value === '' ? null : parseFloat(value)
      setResults(prev => ({ ...prev, [field]: numValue }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateResults = useCallback(() => {
    const newErrors: Record<string, string> = {}

    // Check if at least one measurement is provided
    const hasAnyResult = Object.entries(results).some(([key, value]) => 
      key !== 'notes' && value !== null && value !== undefined
    )

    if (!hasAnyResult) {
      newErrors.general = 'Please enter at least one test measurement'
    }

    // Validate ranges
    if (results.ph !== null && (results.ph < 0 || results.ph > 14)) {
      newErrors.ph = 'pH must be between 0 and 14'
    }

    if (results.chlorine !== null && (results.chlorine < 0 || results.chlorine > 20)) {
      newErrors.chlorine = 'Chlorine must be between 0 and 20 ppm'
    }

    if (results.alkalinity !== null && (results.alkalinity < 0 || results.alkalinity > 500)) {
      newErrors.alkalinity = 'Alkalinity must be between 0 and 500 ppm'
    }

    if (results.hardness !== null && (results.hardness < 0 || results.hardness > 1000)) {
      newErrors.hardness = 'Hardness must be between 0 and 1000 ppm'
    }

    if (results.cyanuricAcid !== null && (results.cyanuricAcid < 0 || results.cyanuricAcid > 300)) {
      newErrors.cyanuricAcid = 'Cyanuric Acid must be between 0 and 300 ppm'
    }

    if (results.bromine !== null && (results.bromine < 0 || results.bromine > 20)) {
      newErrors.bromine = 'Bromine must be between 0 and 20 ppm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [results])

  const handleSubmit = useCallback(() => {
    if (validateResults()) {
      onResultsSubmit(results)
    }
  }, [results, validateResults, onResultsSubmit])

  const testParameters = [
    {
      key: 'ph' as const,
      label: 'pH',
      placeholder: '7.2',
      unit: '',
      step: '0.1',
      description: 'Ideal range: 7.2-7.6'
    },
    {
      key: 'chlorine' as const,
      label: 'Free Chlorine',
      placeholder: '1.5',
      unit: 'ppm',
      step: '0.1',
      description: 'Ideal range: 1-3 ppm'
    },
    {
      key: 'alkalinity' as const,
      label: 'Total Alkalinity',
      placeholder: '120',
      unit: 'ppm',
      step: '10',
      description: 'Ideal range: 80-120 ppm'
    },
    {
      key: 'hardness' as const,
      label: 'Calcium Hardness',
      placeholder: '250',
      unit: 'ppm',
      step: '10',
      description: 'Ideal range: 200-400 ppm'
    },
    {
      key: 'cyanuricAcid' as const,
      label: 'Cyanuric Acid',
      placeholder: '50',
      unit: 'ppm',
      step: '10',
      description: 'Ideal range: 30-50 ppm'
    },
    {
      key: 'bromine' as const,
      label: 'Bromine',
      placeholder: '3.0',
      unit: 'ppm',
      step: '0.1',
      description: 'Ideal range: 3-5 ppm (if using bromine)'
    },
  ]

  return (
    <div
      className={`mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="bg-green-600 p-4 text-white">
        <h3 className="flex items-center space-x-2 text-lg font-semibold">
          <Calculator size={20} />
          <span>Manual Test Results</span>
        </h3>
        <p className="mt-1 text-sm text-green-100">
          Enter your water test measurements manually
        </p>
      </div>

      {/* Form */}
      <div className="max-h-96 overflow-y-auto p-4">
        {errors.general && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          {testParameters.map((param) => (
            <div key={param.key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {param.label}
                {param.unit && <span className="text-gray-500"> ({param.unit})</span>}
              </label>
              <input
                type="number"
                step={param.step}
                min="0"
                placeholder={param.placeholder}
                value={results[param.key] ?? ''}
                onChange={(e) => updateResult(param.key, e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors[param.key]
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors[param.key] && (
                <p className="text-xs text-red-600">{errors[param.key]}</p>
              )}
              <p className="text-xs text-gray-500">{param.description}</p>
            </div>
          ))}

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Additional observations about your pool water..."
              rows={3}
              value={results.notes}
              onChange={(e) => updateResult('notes', e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4">
        <div className="flex justify-center space-x-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 rounded-lg bg-gray-500 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-8 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            <Check size={18} />
            <span>Analyze Results</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-gray-500">
          <Droplets size={12} />
          <span>Enter at least one measurement to proceed</span>
        </div>
      </div>
    </div>
  )
}