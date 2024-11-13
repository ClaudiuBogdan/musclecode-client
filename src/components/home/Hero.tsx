import {motion} from 'motion/react'

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-6">
            Master Algorithms Through Daily Practice
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Build your problem-solving skills with our interactive platform. 
            Practice algorithms, track your progress, and get AI-powered feedback.
          </p>
          <div className="space-x-4">
          </div>
        </motion.div>
      </div>
    </div>
  )
} 