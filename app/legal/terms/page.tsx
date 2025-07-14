"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TermsOfServicePage() {
  const router = useRouter()

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <CheckCircle className="w-5 h-5" />,
      content:
        "By accessing and using moulai's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      id: "service-description",
      title: "Service Description",
      icon: <FileText className="w-5 h-5" />,
      content:
        "moulai provides an AI-powered tax deduction tracking service that analyzes your financial transactions to identify potential tax deductions. Our service includes transaction categorization, deduction identification, report generation, and related financial analysis tools.",
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Provide accurate and complete information when creating your account",
        "Maintain the security of your account credentials",
        "Use the service only for lawful purposes and in accordance with these terms",
        "Review and verify all tax information before filing with relevant authorities",
        "Comply with all applicable laws and regulations regarding tax reporting",
      ],
    },
    {
      id: "data-usage",
      title: "Data Usage and Privacy",
      icon: <Scale className="w-5 h-5" />,
      content:
        "We collect and use your financial data solely for the purpose of providing our tax deduction services. We maintain strict security measures and do not sell your personal information to third parties. For detailed information about our data practices, please refer to our Privacy Policy.",
    },
    {
      id: "limitations",
      title: "Service Limitations",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "Our service provides analysis and suggestions but does not constitute professional tax advice",
        "Users are responsible for verifying all deductions and consulting with tax professionals as needed",
        "We do not guarantee the accuracy of tax calculations or the acceptance of deductions by tax authorities",
        "Service availability may be subject to maintenance windows and technical limitations",
      ],
    },
  ]

  const keyPoints = [
    {
      title: "No Tax Advice",
      description:
        "Our service provides information and analysis, not professional tax advice. Always consult a qualified tax professional for specific guidance.",
    },
    {
      title: "User Verification",
      description:
        "You are responsible for verifying all deductions and tax information before filing with tax authorities.",
    },
    {
      title: "Service Availability",
      description: "We strive for 99.9% uptime but cannot guarantee uninterrupted service availability.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
  onClick={() => router.push("/profile")}
            variant="outline"
            size="icon"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-zinc-400">Legal terms and conditions for using our service</p>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>Last updated: December 29, 2024</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Alert className="border-amber-800 bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              <strong>Important:</strong> These terms constitute a legally binding agreement between you and moulai.
              Please read them carefully before using our service.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to moulai</h2>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                These Terms of Service ("Terms") govern your use of moulai's tax deduction tracking service. By using
                our service, you agree to these terms and our Privacy Policy. We've designed our service to help you
                identify and track tax deductions, but it's important to understand your rights and responsibilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {keyPoints.map((point, index) => (
                  <div key={index} className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                    <h3 className="font-semibold text-white mb-2">{point.title}</h3>
                    <p className="text-zinc-400 text-sm">{point.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="text-[#BEF397]">{section.icon}</div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {Array.isArray(section.content) ? (
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#BEF397] mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-300 leading-relaxed">{section.content}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Scale className="w-5 h-5 text-[#BEF397]" />
                Payment Terms and Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Subscription Billing</h4>
                  <p className="text-zinc-300 mb-4">
                    Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable
                    except as required by law.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Cancellation</h4>
                  <p className="text-zinc-300 mb-4">
                    You may cancel your subscription at any time. Cancellation will take effect at the end of your
                    current billing period.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Price Changes</h4>
                  <p className="text-zinc-300 mb-4">
                    We may change our pricing with 30 days' notice. Changes will apply to your next billing cycle.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Free Trial</h4>
                  <p className="text-zinc-300 mb-4">
                    Free trials are available for new users. No payment is required during the trial period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#BEF397]" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-zinc-300 leading-relaxed mb-4">
                moulai provides its service "as is" without warranties of any kind. We are not liable for any indirect,
                incidental, special, or consequential damages arising from your use of our service. Our total liability
                is limited to the amount you paid for the service in the 12 months preceding the claim.
              </p>
              <Separator className="my-4 bg-zinc-700" />
              <p className="text-zinc-400 text-sm">
                <strong>Tax Professional Disclaimer:</strong> moulai is not a tax preparation service or tax advisory
                firm. We recommend consulting with qualified tax professionals for specific tax advice and before making
                any tax-related decisions.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-[#BEF397]/10 to-[#7DD3FC]/10 border border-[#BEF397]/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h3>
              <p className="text-zinc-300 mb-6">
                If you have any questions about these Terms of Service, please contact our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/support")}
                  className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:opacity-90"
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="border-[#BEF397] text-[#BEF397] hover:bg-[#BEF397] hover:text-black bg-transparent"
                >
                  legal@moulai.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
