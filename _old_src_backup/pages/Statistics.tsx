import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const dailyData = [
  { day: 'Mon', questions: 12, accuracy: 75 },
  { day: 'Tue', questions: 15, accuracy: 78 },
  { day: 'Wed', questions: 10, accuracy: 72 },
  { day: 'Thu', questions: 18, accuracy: 82 },
  { day: 'Fri', questions: 14, accuracy: 76 },
  { day: 'Sat', questions: 20, accuracy: 85 },
  { day: 'Sun', questions: 16, accuracy: 80 },
]

const subjectData = [
  { subject: 'Physics', value: 35 },
  { subject: 'Chemistry', value: 28 },
  { subject: 'Biology', value: 37 },
]

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4']

export default function Statistics() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Statistics & Analytics</h2>
        <p className="text-muted-foreground mt-2">Your detailed performance metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="questions" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={subjectData} cx="50%" cy="50%" labelLine={false} label={({ subject, value }) => `${subject} ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Total Questions</p>
            <p className="text-3xl font-bold mt-2">289</p>
            <p className="text-green-400 text-sm mt-2">+23 this week</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Average Accuracy</p>
            <p className="text-3xl font-bold mt-2">78.5%</p>
            <p className="text-yellow-400 text-sm mt-2">+2.3% improvement</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground text-sm">Study Streak</p>
            <p className="text-3xl font-bold mt-2">12 Days</p>
            <p className="text-blue-400 text-sm mt-2">Keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
