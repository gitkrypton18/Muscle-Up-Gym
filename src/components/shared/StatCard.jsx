import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({ title, value, icon: Icon, color }) {
  const colorStyles = {
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  }

  return (
    <Card className="bg-card border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-full", colorStyles[color] || colorStyles.blue)}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  )
}
