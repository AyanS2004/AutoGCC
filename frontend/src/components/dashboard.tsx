"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Download, Upload, Settings, Activity, Database, FileText, MessageCircle } from 'lucide-react'
import gccApi, { ExtractionStatus, CompanyData, LogEntry } from '@/lib/api'
import { ConfigPanel } from './config-panel'
import { DataTable } from './data-table'
import { LogsViewer } from './logs-viewer'
import { StatsCards } from './stats-cards'
import { ChatInterface } from './chat-interface'

export function Dashboard() {
  const [status, setStatus] = useState<ExtractionStatus | null>(null)
  const [data, setData] = useState<CompanyData[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    // Poll status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const statusData = await gccApi.getStatus()
        setStatus(statusData)
      } catch (error) {
        console.error('Error fetching status:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Fetch data and logs periodically
    const interval = setInterval(async () => {
      try {
        const [dataResult, logsResult] = await Promise.all([
          gccApi.getData(),
          gccApi.getLogs(50)
        ])
        setData(dataResult)
        setLogs(logsResult)
      } catch (error) {
        console.error('Error fetching data/logs:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    setIsLoading(true)
    try {
      await gccApi.startExtraction()
    } catch (error) {
      console.error('Error starting extraction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    setIsLoading(true)
    try {
      await gccApi.stopExtraction()
    } catch (error) {
      console.error('Error stopping extraction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const blob = await gccApi.downloadResults()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'gcc_results.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading results:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GCC Data Extractor</h1>
          <p className="text-muted-foreground">
            Automated extraction of Global Capability Center data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!data.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </Button>
          {status?.is_running ? (
            <Button onClick={handleStop} disabled={isLoading} variant="destructive">
              <Pause className="mr-2 h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button onClick={handleStart} disabled={isLoading}>
              <Play className="mr-2 h-4 w-4" />
              Start Extraction
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}

      {/* Status Cards */}
      <StatsCards status={status} />

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Extraction Progress</CardTitle>
              <CardDescription>
                {status?.is_running ? 'Extraction in progress...' : 'Ready to start'}
              </CardDescription>
            </div>
            <Badge variant={status?.is_running ? 'default' : 'secondary'}>
              {status?.is_running ? (
                <>
                  <Activity className="mr-1 h-3 w-3 animate-pulse" />
                  Running
                </>
              ) : (
                'Idle'
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{status?.progress_percentage || 0}%</span>
            </div>
            <Progress value={status?.progress_percentage || 0} />
          </div>

          {status?.current_field && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Field</span>
                <Badge variant="outline">{status.current_field}</Badge>
              </div>
              {status.current_batch && status.total_batches && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Batch</span>
                  <span className="font-medium">
                    {status.current_batch} / {status.total_batches}
                  </span>
                </div>
              )}
            </div>
          )}

          {status?.current_companies && status.current_companies.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Processing Companies:</span>
              <div className="flex flex-wrap gap-2">
                {status.current_companies.map((company, idx) => (
                  <Badge key={idx} variant="secondary">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Processed</p>
              <p className="text-2xl font-bold text-green-600">
                {status?.companies_processed || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-blue-600">
                {status?.companies_remaining || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Data, Chat, and Logs */}
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">
            <Database className="mr-2 h-4 w-4" />
            Extracted Data
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="mr-2 h-4 w-4" />
            Talk with Data
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="space-y-4">
          <DataTable data={data} />
        </TabsContent>
        <TabsContent value="chat" className="space-y-4">
          <ChatInterface />
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <LogsViewer logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

