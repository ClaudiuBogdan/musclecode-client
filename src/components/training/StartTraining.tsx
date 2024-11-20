import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Dumbbell, Brain, Code, Database, GitBranch, Zap, Clock, Trophy } from 'lucide-react'
import { Link } from '@tanstack/react-router'

type Exercise = {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Algorithms' | 'Data Structures';
  icon: React.ReactNode;
  muscleGroup: 'Logic' | 'Memory' | 'Efficiency';
  xp: number;
}

const mockExercises: Exercise[] = [
  { id: '1', title: 'Array Bicep Curls', difficulty: 'Beginner', category: 'Data Structures', icon: <Database className="w-4 h-4" />, muscleGroup: 'Memory', xp: 10 },
  { id: '2', title: 'Binary Search Squats', difficulty: 'Intermediate', category: 'Algorithms', icon: <Code className="w-4 h-4" />, muscleGroup: 'Logic', xp: 20 },
  { id: '3', title: 'Graph Traversal Treadmill', difficulty: 'Advanced', category: 'Algorithms', icon: <GitBranch className="w-4 h-4" />, muscleGroup: 'Efficiency', xp: 30 },
]

type SkillLevels = {
  logic: number;
  memory: number;
  efficiency: number;
}

const initialSkillLevels: SkillLevels = {
  logic: 30,
  memory: 25,
  efficiency: 20,
}

export default function AlgorithmGymDashboard() {
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null)
  const [skillLevels, setSkillLevels] = useState<SkillLevels>(initialSkillLevels)
  const [streak, setStreak] = useState(3)
  const [todayXP, setTodayXP] = useState(0)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const totalLevel = Object.values(skillLevels).reduce((sum, level) => sum + level, 0)
  const avatarLevel = Math.floor(totalLevel / 30)

  const getAvatarStateClass = (level: number) => {
    if (level < 3) return 'bg-red-200'
    if (level < 7) return 'bg-yellow-200'
    return 'bg-green-200'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Algorithm Gym</CardTitle>
        <CardDescription>
          Train your coding muscles daily with algorithm and data structure workouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getAvatarStateClass(avatarLevel)}`}>
              <Brain className="w-16 h-16" />
            </div>
            <p className="mt-2 font-semibold">Level {avatarLevel}</p>
          </div>
          <div className="flex-grow space-y-2">
            {Object.entries(skillLevels).map(([skill, level]) => (
              <div key={skill} className="flex items-center">
                {skill === 'logic' && <Zap className="w-4 h-4 mr-2" />}
                {skill === 'memory' && <Database className="w-4 h-4 mr-2" />}
                {skill === 'efficiency' && <Clock className="w-4 h-4 mr-2" />}
                <span className="w-20 shrink-0">{skill.charAt(0).toUpperCase() + skill.slice(1)}:</span>
                <Progress value={level} className="w-full" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{streak}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
            <div className="mt-2">
              <Trophy className="w-6 h-6 inline-block mr-2" />
              <span>{todayXP} XP Today</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts">Today's Workouts</TabsTrigger>
            <TabsTrigger value="calendar">Training Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="workouts">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {mockExercises.map((exercise) => (
                <Card 
                  key={exercise.id} 
                  className={`cursor-pointer transition-all duration-300 ${
                    hoveredExercise === exercise.id ? 'shadow-lg scale-105' : ''
                  }`}
                  onMouseEnter={() => setHoveredExercise(exercise.id)}
                  onMouseLeave={() => setHoveredExercise(null)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{exercise.title}</CardTitle>
                    <Dumbbell className="w-4 h-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant={exercise.difficulty === 'Beginner' ? 'secondary' : exercise.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                        {exercise.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{exercise.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{exercise.muscleGroup}</Badge>
                      <span className="text-sm font-semibold">{exercise.xp} XP</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <div className="flex justify-center mt-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
      <Link to="/algorithm/$id" params={{ id: "1234" }}>
        <Button size="lg" className="w-full sm:w-auto">
          Start Today's Workout <Dumbbell className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      </CardFooter>
    </Card>
  )
}