import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'

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
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/algorithms"
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Browse Algorithms
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 