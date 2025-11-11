"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CompanyData } from '@/lib/api'
import { ExternalLink } from 'lucide-react'

interface DataTableProps {
  data: CompanyData[]
}

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Start the extraction process to see data here
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Data</CardTitle>
        <CardDescription>
          Showing {data.length} companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Company</th>
                <th className="text-left p-3 font-medium">Industries</th>
                <th className="text-left p-3 font-medium">Revenue (M)</th>
                <th className="text-left p-3 font-medium">GBS</th>
                <th className="text-left p-3 font-medium">Global Units</th>
                <th className="text-left p-3 font-medium">India Units</th>
                <th className="text-left p-3 font-medium">Locations</th>
              </tr>
            </thead>
            <tbody>
              {data.map((company, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{company.company_name}</td>
                  <td className="p-3">
                    {company.industries && company.industries !== 'NA' ? (
                      <div className="flex flex-wrap gap-1">
                        {company.industries.split(',').map((ind, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {ind.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {company.revenue && company.revenue !== 'NA' ? (
                      <span>${company.revenue}M</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {company.gbs && company.gbs !== 'NA' ? (
                      <Badge variant={company.gbs === 'Yes' ? 'success' : 'secondary'}>
                        {company.gbs}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {company.global_gcc_units && company.global_gcc_units !== 'NA' 
                      ? company.global_gcc_units 
                      : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="p-3">
                    {company.india_gcc_units && company.india_gcc_units !== 'NA' 
                      ? company.india_gcc_units 
                      : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="p-3">
                    {company.gcc_locations_india && company.gcc_locations_india !== 'NA' ? (
                      <div className="flex flex-wrap gap-1">
                        {company.gcc_locations_india.split(',').slice(0, 3).map((loc, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {loc.trim()}
                          </Badge>
                        ))}
                        {company.gcc_locations_india.split(',').length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.gcc_locations_india.split(',').length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}


