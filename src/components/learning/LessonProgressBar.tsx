import React from 'react'
import { LessonChunk } from '@/types/lesson'
import { motion } from 'framer-motion'
import { HelpCircleIcon, LightbulbIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonProgressBarProps {
  chunks: LessonChunk[]
  currentChunkIndex: number
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  chunks,
  currentChunkIndex,
}) => {
  const total = chunks.length
  const denom = total > 1 ? total - 1 : 1
  const progress = Math.max(0, Math.min((currentChunkIndex / denom) * 100, 100))
  const leftPct = (idx: number) => (idx / denom) * 100

  const getIconForChunk = (type: LessonChunk['type']) => {
    if (type === 'question') return HelpCircleIcon
    if (type === 'flashcard') return LightbulbIcon
    return null
  }

  return (
    <div className="relative w-full h-3">
      <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-700" />
      <motion.div
        className="absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-blue-600 rounded-full"
        style={{ width: `${progress}%` }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      />
      <div className="absolute inset-0 pointer-events-none">
        {chunks.map((_, idx) =>
          idx > 0 && idx < total - 1 ? (
            <div
              key={`sep-${idx}`}
              className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPct(idx)}%` }}
            >
              <div
                className={cn(
                  'w-0.5 h-2 bg-gray-600 rounded-full opacity-80 transition-all duration-200 ease-in-out',
                  idx === currentChunkIndex && 'bg-blue-600'
                )}
              />
            </div>
          ) : null
        )}
      </div>
      <div className="absolute inset-0 flex items-center">
        {chunks.map((chunk, idx) => {
          const Icon = getIconForChunk(chunk.type)
          if (!Icon) return null
          const isCompleted = idx < currentChunkIndex
          const isCurrent = idx === currentChunkIndex
          return (
            <div
              key={chunk.id}
              className="absolute transform -translate-x-1/2"
              style={{
                left: `${leftPct(idx)}%`,
                top: isCurrent ? '-11px' : '-9px',
                zIndex: isCurrent ? 20 : 5,
              }}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 ease-in-out',
                  isCurrent ? 'w-6 h-6' : 'w-5 h-5',
                  isCompleted
                    ? 'bg-blue-500 border-blue-700 dark:bg-blue-600 dark:border-blue-800'
                    : isCurrent
                      ? 'bg-white border-blue-600 dark:bg-gray-800 dark:border-blue-500'
                      : 'bg-white border-gray-400 dark:bg-gray-800 dark:border-gray-600'
                )}
              >
                <Icon
                  className={cn(
                    isCurrent ? 'w-4 h-4' : 'w-3 h-3',
                    isCompleted
                      ? 'text-white'
                      : isCurrent
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                  )}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
