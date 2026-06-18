import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({ title, value, icon: Icon, color, onClick }) {
  const colorStyles = {
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  }

  const glowMap = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "glass-card group overflow-hidden relative transition-all duration-300", 
        onClick ? "cursor-pointer hover:border-border hover:-translate-y-1 hover:shadow-lg" : ""
      )}
    >
      {/* Decorative gradient blob */}
      <div className={cn(
        "absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-20 transition-all duration-500",
        onClick ? "group-hover:scale-150" : "",
        glowMap[color] || glowMap.blue
      )} />

      <CardContent className="p-4 sm:p-5 flex items-center justify-between relative z-10 gap-3">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</p>
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight mt-0.5 break-words">{value}</h3>
        </div>
        <div className={cn("p-2.5 sm:p-3 rounded-xl transition-all duration-300 shrink-0", colorStyles[color] || colorStyles.blue)}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </CardContent>
    </Card>
  )
}
