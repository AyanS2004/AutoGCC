"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { ExtractionStatus } from '@/lib/api'

interface StatsCardsProps {
  status: ExtractionStatus | null
}

export function StatsCards({ status }: StatsCardsProps) {
  const successRate = status
    ? ((status.successful_extractions / Math.max(1, status.successful_extractions + status.failed_extractions)) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Session ID</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xs font-mono text-muted-foreground truncate">
            {status?.session_id || 'Not started'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Successful</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {status?.successful_extractions || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Extractions completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {status?.failed_extractions || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Extractions failed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {successRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            Overall success rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


