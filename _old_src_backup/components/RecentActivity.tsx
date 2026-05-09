import { CheckCircle2, Clock } from 'lucide-react'

const activities = [
  { id: 1, type: 'completed', text: 'Completed Biology Chapter 5', time: '2 hours ago' },
  { id: 2, type: 'practice', text: 'Practiced 15 Chemistry questions', time: '4 hours ago' },
  { id: 3, type: 'completed', text: 'Completed Physics Mock Test', time: '1 day ago' },
  { id: 4, type: 'practice', text: 'Reviewed Organic Chemistry notes', time: '2 days ago' },
]

export default function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
            <div className="p-2 bg-primary-600/20 rounded-lg mt-1 flex-shrink-0">
              {activity.type === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-primary-400" />
              ) : (
                <Clock className="w-5 h-5 text-primary-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{activity.text}</p>
              <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
