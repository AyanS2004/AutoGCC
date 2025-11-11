"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Save } from 'lucide-react'
import gccApi, { ExtractionConfig } from '@/lib/api'

interface ConfigPanelProps {
  onClose: () => void
}

export function ConfigPanel({ onClose }: ConfigPanelProps) {
  const [config, setConfig] = useState<ExtractionConfig>({
    input_file: 'solutions.xlsx',
    output_file: 'solutions.xlsx',
    template_file: 'template.xlsx',
    batch_size: 3,
    max_retries: 3,
    response_timeout: 120,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true)
      try {
        const configData = await gccApi.getConfig()
        setConfig(configData)
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await gccApi.updateConfig(config)
      onClose()
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Configure extraction settings and file paths
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Loading configuration...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="input_file">Input File</Label>
                <Input
                  id="input_file"
                  value={config.input_file}
                  onChange={(e) => setConfig({ ...config, input_file: e.target.value })}
                  placeholder="solutions.xlsx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="output_file">Output File</Label>
                <Input
                  id="output_file"
                  value={config.output_file}
                  onChange={(e) => setConfig({ ...config, output_file: e.target.value })}
                  placeholder="solutions.xlsx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_file">Template File</Label>
              <Input
                id="template_file"
                value={config.template_file}
                onChange={(e) => setConfig({ ...config, template_file: e.target.value })}
                placeholder="template.xlsx"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="batch_size">Batch Size</Label>
                <Input
                  id="batch_size"
                  type="number"
                  min="1"
                  max="10"
                  value={config.batch_size}
                  onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_retries">Max Retries</Label>
                <Input
                  id="max_retries"
                  type="number"
                  min="1"
                  max="10"
                  value={config.max_retries}
                  onChange={(e) => setConfig({ ...config, max_retries: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="response_timeout">Timeout (seconds)</Label>
                <Input
                  id="response_timeout"
                  type="number"
                  min="30"
                  max="300"
                  value={config.response_timeout}
                  onChange={(e) => setConfig({ ...config, response_timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}


