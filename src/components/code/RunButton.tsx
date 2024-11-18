import { PlayIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'

interface RunButtonProps {
  onRun: () => void
  isRunning: boolean
}

export function RunButton({ onRun, isRunning }: RunButtonProps) {
  return (
    <Button 
      onClick={onRun} 
      disabled={isRunning}
      className="gap-2 min-w-[120px] text-gray-200 hover:text-green-400 border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-700/50"
      variant="outline"
    >
      <PlayIcon className="h-4 w-4" />
      {isRunning ? 'Running...' : 'Run Code'}
    </Button>
  )
}