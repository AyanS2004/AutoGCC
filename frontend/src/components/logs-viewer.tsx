"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogEntry } from '@/lib/api'
import { AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react'

interface LogsViewerProps {
  logs: LogEntry[]
}

export function LogsViewer({ logs }: LogsViewerProps) {
  const getLogIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getLogBadgeVariant = (level: string): "default" | "destructive" | "warning" | "secondary" => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'warning'
      case 'info':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>No logs available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Logs will appear here once the extraction starts
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
        <CardDescription>
          Recent activity logs ({logs.length} entries)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="mt-1">{getLogIcon(log.level)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getLogBadgeVariant(log.level)} className="text-xs">
                    {log.level.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm font-mono">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


