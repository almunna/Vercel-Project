"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Sparkles,
  Shield,
  ShieldCheck,
  Star,
  Award,
  FileCheck,
  Brain,
  Check,
  CreditCard,
  BarChart3,
  Users,
  Calculator,
  FileText,
  Smartphone,
  Globe,
  Play,
  CheckCircle2,
  Briefcase,
  Home,
  Car,
  Laptop,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  const deductionCategories = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Business Expenses",
      amount: "$2,400",
      items: ["Office supplies", "Software subscriptions", "Professional development", "Networking events"],
    },
    {
      icon: <Car className="w-6 h-6" />,
      title: "Vehicle & Travel",
      amount: "$1,800",
      items: ["Fuel costs", "Vehicle maintenance", "Parking fees", "Public transport"],
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: "Home Office",
      amount: "$1,200",
      items: ["Utilities", "Internet", "Office furniture", "Equipment depreciation"],
    },
    {
      icon: <Laptop className="w-6 h-6" />,
      title: "Technology",
      amount: "$900",
      items: ["Computer equipment", "Mobile phone", "Software licenses", "Cloud storage"],
    },
  ]

  const industries = [
    { name: "Healthcare", icon: "🏥", savings: "$4,200" },
    { name: "Construction", icon: "🏗️", savings: "$5,800" },
    { name: "Real Estate", icon: "🏠", savings: "$3,900" },
    { name: "Consulting", icon: "💼", savings: "$3,400" },
    { name: "Retail", icon: "🛍️", savings: "$2,800" },
    { name: "Technology", icon: "💻", savings: "$4,100" },
    { name: "Education", icon: "📚", savings: "$2,600" },
    { name: "Finance", icon: "💰", savings: "$4,500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <span className="text-[#BEF397] text-2xl font-bold">moulai.</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-zinc-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-zinc-300 hover:text-white transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-zinc-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-zinc-300 hover:text-white transition-colors">
                Reviews
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/onboarding/welcome")}
                className="text-zinc-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/onboarding/welcome")}
                className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-lg hover:shadow-[#BEF397]/20 transition-all duration-300"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24">
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ? "#BEF397" : i % 3 === 1 ? "#7DD3FC" : "#E5B1FD"
                } 0%, transparent 70%)`,
                width: `${200 + Math.random() * 400}px`,
                height: `${200 + Math.random() * 400}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0],
                scale: [1, 1.3, 0.7, 1],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-[#BEF397] rounded-full opacity-40"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-7xl mx-auto text-center space-y-12">
            {/* Main Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-zinc-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-zinc-700/50"
                >
                  <Sparkles className="w-5 h-5 text-[#BEF397]" />
                  <span className="text-zinc-300 text-sm font-medium">Australia's #1 AI Tax Deduction Finder</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                  Find Every Tax Deduction{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BEF397] via-[#7DD3FC] to-[#E5B1FD]">
                    Automatically
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed max-w-4xl mx-auto">
                  Connect your bank accounts and let our AI analyze every transaction to find hidden tax deductions.
                  Australian taxpayers save an average of <span className="text-[#BEF397] font-bold">$3,200 extra</span>{" "}
                  with Moulai.
                </p>
              </div>

              {/* Hero Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#BEF397] mb-2">$3,200</div>
                  <div className="text-zinc-400">Average Extra Refund</div>
                </div>
{/*                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#7DD3FC] mb-2">10K+</div>
                  <div className="text-zinc-400">Happy Customers</div>
                </div>*/}
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#E5B1FD] mb-2">5 min</div>
                  <div className="text-zinc-400">Setup Time</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#BEF397] mb-2">98%</div>
                  <div className="text-zinc-400">Accuracy Rate</div>
                </div>
              </motion.div>

              {/* Hero CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
<div className="flex flex-col gap-4 justify-center items-center">
  <Button
    onClick={() => router.push("/onboarding/welcome")}
    className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-2xl hover:shadow-[#BEF397]/20 transition-all duration-300 rounded-2xl group"
  >
    Start Finding Deductions
    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
  </Button>
  <div className="flex items-center gap-2 text-zinc-400 text-sm mt-2">
    <Check className="w-5 h-5 text-[#BEF397]" />
    <span>Free to start • No credit card required • 5 minute setup</span>
  </div>
</div>

{/*                <Button
                  onClick={() => router.push("/onboarding/welcome")}
                  className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-2xl hover:shadow-[#BEF397]/20 transition-all duration-300 rounded-2xl group"
                >
                  Start Finding Deductions
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>*/}
{/*                <Button
                  variant="outline"
                  className="h-16 px-8 text-lg border-zinc-700 text-white hover:bg-zinc-800 rounded-2xl group bg-transparent"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>*/}
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] border-2 border-black flex items-center justify-center"
                      >
                        <Star className="w-5 h-5 text-black fill-current" />
                      </div>
                    ))}
                  </div>
                  <div className="ml-3">
                    <div className="text-white font-semibold">4.9/5 Rating</div>
                    <div className="text-zinc-400 text-sm">Trusted by Australians</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[#BEF397]" />
                    <span className="text-zinc-300 font-medium">Bank-Level Security</span>
                  </div>
{/*                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#7DD3FC]" />
                    <span className="text-zinc-300 font-medium">ATO Compliant</span>
                  </div>*/}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deduction Categories Preview */}
      <section className="py-20 bg-zinc-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Discover Deductions in <span className="text-[#BEF397]">Every Category</span>
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Our AI scans your transactions across all expense categories to find every possible deduction
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deductionCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-black">{category.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{category.title}</h3>
                    <div className="text-[#BEF397] font-bold text-xl">{category.amount}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Check className="w-4 h-4 text-[#BEF397]" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              How <span className="text-[#BEF397]">moulai</span> Works
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Our AI-powered platform makes finding tax deductions effortless. Connect, analyze, and maximize your
              refund in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <CreditCard className="w-10 h-10" />,
                title: "Connect Your Accounts",
                description:
                  "Securely link your bank accounts and credit cards using bank-level encryption. We support all major Australian banks and financial institutions.",
                features: [
                  "256-bit SSL encryption",
                  "Read-only access",
                  "All major banks supported",
                  "Instant connection",
                ],
                color: "from-[#BEF397] to-[#7DD3FC]",
              },
              {
                step: "02",
                icon: <Brain className="w-10 h-10" />,
                title: "AI Analyzes Everything",
                description:
                  "Our advanced AI scans every transaction, categorizes expenses using ANZSIC codes, and identifies potential deductions with 98% accuracy.",
                features: [
                  "ANZSIC code classification",
                  "Machine learning analysis",
                  "Pattern recognition",
                  "Real-time processing",
                ],
                color: "from-[#7DD3FC] to-[#E5B1FD]",
              },
              {
                step: "03",
                icon: <BarChart3 className="w-10 h-10" />,
                title: "Maximize Your Refund",
                description:
                  "Get a detailed report of all deductions found, with ATO compliance verification and explanations for each deduction claimed.",
                features: ["ATO compliant reports", "Detailed explanations", "Export to tax software", "CPA reviewed"],
                color: "from-[#E5B1FD] to-[#BEF397]",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-zinc-800/30 backdrop-blur-sm rounded-3xl p-8 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-7xl font-bold text-zinc-800/50">{feature.step}</div>
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                    >
                      <div className="text-black">{feature.icon}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed mb-6">{feature.description}</p>
                  <div className="space-y-3">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#BEF397]" />
                        <span className="text-zinc-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry-Specific Section */}
      <section className="py-20 bg-zinc-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Tailored for <span className="text-[#BEF397]">Your Industry</span>
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Our AI understands industry-specific deductions and ANZSIC codes to maximize your refund
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 text-center group hover:scale-105"
              >
                <div className="text-4xl mb-3">{industry.icon}</div>
                <h3 className="text-white font-bold mb-2">{industry.name}</h3>
                <div className="text-[#BEF397] font-bold text-lg">{industry.savings}</div>
                <div className="text-zinc-400 text-sm">avg. savings</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Powerful Features for <span className="text-[#BEF397]">Maximum Savings</span>
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Everything you need to find, track, and claim every tax deduction you're entitled to
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI-Powered Detection",
                description: "Advanced machine learning identifies deductions with 98% accuracy",
                color: "from-[#BEF397] to-[#7DD3FC]",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Local Data Processing",
                description: "We never save your data. Your statement is processed instantly and not kept anywhere.",
                color: "from-[#7DD3FC] to-[#E5B1FD]",
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "ATO Compliant Reports",
                description: "We prepare and lodge your return through our approved registered tax agents and qualified CPAs.",
                color: "from-[#E5B1FD] to-[#BEF397]",
              },
{
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Audit-Ready Support",
    description: "Expert assistance and guidance if your return is reviewed by the ATO.",
    color: "from-[#BEF397] to-[#7DD3FC]",
  },
              {
                icon: <Calculator className="w-8 h-8" />,
                title: "Tax Calculator",
                description: "Estimate your refund and plan your tax strategy",
                color: "from-[#7DD3FC] to-[#E5B1FD]",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Multi-Bank Support",
                description: "Connect accounts from all major Australian banks",
                color: "from-[#E5B1FD] to-[#BEF397]",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 group"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className="text-black">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by <span className="text-[#BEF397]">50,000+</span> Australians
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              See how moulai has helped thousands discover hidden deductions and maximize their tax refunds
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Michael Chen",
                role: "Small Business Owner",
                location: "Melbourne",
                amount: "$4,800",
                quote:
                  "Moulai found $4,800 in deductions I completely missed. The AI caught business expenses from months ago that I'd forgotten about. Incredible!",
                avatar: "M",
                rating: 5,
              },
              {
                name: "Sarah Williams",
                role: "Freelance Designer",
                location: "Sydney",
                amount: "$2,400",
                quote:
                  "As a freelancer, tracking deductions was a nightmare. Moulai automated everything and found deductions I didn't even know existed.",
                avatar: "S",
                rating: 5,
              },
              {
                name: "David Thompson",
                role: "Property Investor",
                location: "Brisbane",
                amount: "$6,200",
                quote:
                  "The property investment deductions alone saved me thousands. The AI understands tax law better than I do!",
                avatar: "D",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-zinc-800/20 to-zinc-700/20 backdrop-blur-sm rounded-2xl p-8 border border-zinc-700/30"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-[#BEF397] fill-current" />
                        ))}
                      </div>
                      <span className="text-[#BEF397] font-bold text-lg">{testimonial.amount}</span>
                    </div>
                    <div className="text-white font-bold text-lg">{testimonial.name}</div>
                    <div className="text-zinc-400">
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-300 leading-relaxed text-lg">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 text-center">
              <Award className="w-12 h-12 text-[#BEF397] mx-auto mb-4" />
              <div className="text-white font-bold text-lg mb-2">ATO Aligned</div>
              <div className="text-zinc-400 text-sm">Built to align with Australian Tax Office rules</div>
            </div>
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 text-center">
              <FileCheck className="w-12 h-12 text-[#7DD3FC] mx-auto mb-4" />
              <div className="text-white font-bold text-lg mb-2">CPA Reviewed</div>
              <div className="text-zinc-400 text-sm">Reviewed and approved by certified public accountants</div>
            </div>
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 text-center">
              <Shield className="w-12 h-12 text-[#E5B1FD] mx-auto mb-4" />
              <div className="text-white font-bold text-lg mb-2">Local Data Only</div>
              <div className="text-zinc-400 text-sm">Your statements are processed securely and never stored.</div>
            </div>
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 text-center">
              <Brain className="w-12 h-12 text-[#BEF397] mx-auto mb-4" />
              <div className="text-white font-bold text-lg mb-2">AI-Powered</div>
              <div className="text-zinc-400 text-sm">Advanced machine learning finds every deduction</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black/50">
      <div id="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
  {[
    {
      name: "AI Smart Review",
      price: "$19.99",
      period: "per month",
      description: "AI-powered optimization with unlimited features",
      features: [
        "Unlimited transaction analysis",
        "AI-powered deduction detection",
        "Advanced analytics & insights",
        "Export to PDF, CSV, Excel",
        "Tax optimization suggestions",
        "Priority email support",
        "Subscription cost may be tax deductible",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Premium CPA Service",
      price: "$49.92",
      period: "per month",
      description: "Complete CPA review, lodgment & optimization",
      features: [
        "Everything in AI Smart Review",
        "Professional tax lodgment in 48 hours",
        "Personal CPA consultation",
        "Personalized tax strategies",
        "Audit protection & support",
        "Subscription cost may be tax deductible",
      ],
      cta: "Get Started",
      popular: true,
    },
  ].map((plan, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
      className={`relative bg-zinc-800/30 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 ${
        plan.popular
          ? "border-[#BEF397] shadow-2xl shadow-[#BEF397]/10 scale-105"
          : "border-zinc-700/50 hover:border-zinc-600/50"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black px-6 py-2 rounded-full text-sm font-bold">
            Most Popular
          </div>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.period && <span className="text-zinc-400 ml-2">{plan.period}</span>}
        </div>
        <p className="text-zinc-400">{plan.description}</p>
      </div>
      <div className="space-y-4 mb-8">
        {plan.features.map((feature, featureIndex) => (
          <div key={featureIndex} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[#BEF397]" />
            <span className="text-zinc-300">{feature}</span>
          </div>
        ))}
      </div>
      <Button
        onClick={() => router.push("/onboarding/welcome")}
        className={`w-full h-12 font-bold rounded-xl transition-all duration-300 ${
          plan.popular
            ? "bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-lg hover:shadow-[#BEF397]/20"
            : "bg-zinc-700 text-white hover:bg-zinc-600"
        }`}
      >
        {plan.cta}
      </Button>
    </motion.div>
  ))}
</div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-zinc-900/50 to-black/50 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              Ready to Find Your Hidden{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BEF397] to-[#7DD3FC]">
                Deductions?
              </span>
            </h2>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Join Australians who've discovered an average of $3,200 in additional tax deductions with moulai.
              Start your free analysis today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => router.push("/onboarding/welcome")}
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-2xl hover:shadow-[#BEF397]/20 transition-all duration-300 rounded-2xl group"
              >
                Start Finding Deductions
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-2 text-zinc-400">
                <Check className="w-5 h-5 text-[#BEF397]" />
                <span>Free to start • No credit card required • 5 minute setup</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

<footer className="bg-black border-t border-zinc-800/50">
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8 md:gap-16">
      {/* Branding */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="text-[#BEF397] text-2xl font-bold">moulai.</span>
        </div>
        <p className="text-zinc-400 max-w-md">
          Australia's #1 AI-powered tax deduction finder. Helping Australians maximize their tax refunds since 2023.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#BEF397] fill-current" />
            <span className="text-zinc-300 text-sm">4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#7DD3FC]" />
            <span className="text-zinc-300 text-sm">50K+ Users</span>
          </div>
        </div>
      </div>

      {/* Product */}
      <div>
        <h4 className="text-white font-bold mb-4">Product</h4>
        <div className="space-y-2">
          <a href="#features" className="text-zinc-400 hover:text-white transition-colors block">
            Features
          </a>
          <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors block">
            Pricing
          </a>
        </div>
      </div>

      {/* Support */}
      <div>
        <h4 className="text-white font-bold mb-4">Support</h4>
        <div className="space-y-2">
          <a href="/helpcenter" className="text-zinc-400 hover:text-white transition-colors block">
            Help Center
          </a>
          <a href="/privacy" className="text-zinc-400 hover:text-white transition-colors block">
            Privacy Policy
          </a>
          <a href="/terms" className="text-zinc-400 hover:text-white transition-colors block">
            Terms of Service
          </a>
        </div>
      </div>
    </div>

    <div className="border-t border-zinc-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-zinc-400 text-sm">© 2024 moulai. All rights reserved.</p>
      <div className="flex items-center gap-6 mt-4 md:mt-0">
{/*        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#BEF397]" />
          <span className="text-zinc-400 text-sm">SOC 2 Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#7DD3FC]" />
          <span className="text-zinc-400 text-sm">ATO Approved</span>
        </div>*/}
      </div>
    </div>
  </div>
</footer>

    </div>
  )
}
