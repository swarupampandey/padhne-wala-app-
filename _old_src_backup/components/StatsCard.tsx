import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
  color: string
}

export default function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all card-hover`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  )
}
