import { BookOpen } from 'lucide-react'

const upcomingTopics = [
  { id: 1, subject: 'Physics', topic: 'Thermodynamics', progress: 45 },
  { id: 2, subject: 'Chemistry', topic: 'Acids & Bases', progress: 60 },
  { id: 3, subject: 'Biology', topic: 'Genetics', progress: 30 },
]

export default function UpcomingTopics() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Upcoming Topics</h3>
      <div className="space-y-6">
        {upcomingTopics.map(item => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.topic}</p>
                  <p className="text-xs text-muted-foreground">{item.subject}</p>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground text-right">{item.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  )
}
