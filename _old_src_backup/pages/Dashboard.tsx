import { BookOpen, Brain, TrendingUp, Flame } from 'lucide-react'
import StatsCard from '@components/StatsCard'
import RecentActivity from '@components/RecentActivity'
import UpcomingTopics from '@components/UpcomingTopics'

export default function Dashboard() {
  const stats = [
    { icon: BookOpen, label: 'Questions Solved', value: '156', color: 'from-blue-600 to-blue-400' },
    { icon: Brain, label: 'Topics Covered', value: '24', color: 'from-purple-600 to-purple-400' },
    { icon: TrendingUp, label: 'Accuracy', value: '78%', color: 'from-green-600 to-green-400' },
    { icon: Flame, label: 'Current Streak', value: '12 days', color: 'from-orange-600 to-orange-400' },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Track your NEET preparation progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <UpcomingTopics />
        </div>
      </div>
    </div>
  )
}
