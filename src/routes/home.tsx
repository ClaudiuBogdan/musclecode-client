import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAuthStore } from '../lib/auth/authStore'
import { Hero } from '../components/home/Hero'
import { Features } from '../components/home/Features'
import { CTASection } from '../components/home/CTASection'

export function HomePage() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <CTASection />
    </div>
  )
} 