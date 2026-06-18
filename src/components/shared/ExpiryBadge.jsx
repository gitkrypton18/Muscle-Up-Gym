import React from 'react'
import { Badge } from '@/components/ui/badge'

export function ExpiryBadge({ daysRemaining }) {
  if (daysRemaining === undefined || daysRemaining === null) {
    return <Badge variant="outline">Unknown</Badge>
  }

  if (daysRemaining < 0) {
    return <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">Expired</Badge>
  }

  if (daysRemaining === 0) {
    return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-500/50">Ends today</Badge>
  }

  if (daysRemaining <= 5) {
    return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-500/50">{daysRemaining} days left</Badge>
  }

  return <Badge variant="outline" className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50">Active</Badge>
}
