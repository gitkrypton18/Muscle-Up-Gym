
import { Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ActionButtons({ phone, whatsapp, message }) {
  const handleCall = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `tel:+91${phone}`
  }

  const handleWhatsApp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const waNumber = whatsapp || phone
    const textParam = message ? `?text=${encodeURIComponent(message)}` : ''
    window.open(`https://wa.me/91${waNumber}${textParam}`, '_blank')
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-150"
        onClick={handleCall}
        title="Call"
      >
        <Phone className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-500 transition-all duration-150"
        onClick={handleWhatsApp}
        title="WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  )
}
