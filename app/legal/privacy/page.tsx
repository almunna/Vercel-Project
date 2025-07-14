"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Eye, Lock, Database, Users, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, phone number, and financial account information.",
        },
        {
          subtitle: "Financial Data",
          text: "With your consent, we securely access your bank account information through our trusted banking partners to analyze your transactions and identify potential tax deductions.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our services, including your IP address, browser type, device information, and usage patterns.",
        },
      ],
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our tax deduction services, including analyzing your financial transactions and generating tax reports.",
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you service-related notifications, updates, and promotional materials (which you can opt out of at any time).",
        },
        {
          subtitle: "Legal Compliance",
          text: "We may use your information to comply with applicable laws, regulations, and legal processes.",
        },
      ],
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: <Users className="w-5 h-5" />,
      content: [
        {
          subtitle: "Service Providers",
          text: "We may share your information with trusted third-party service providers who assist us in operating our services, such as cloud hosting providers and payment processors.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, regulation, or legal process, or to protect the rights, property, or safety of our users or others.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.",
        },
      ],
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
      content: [
        {
          subtitle: "Encryption",
          text: "We use industry-standard encryption to protect your data both in transit and at rest. All financial data is encrypted using bank-grade security measures.",
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls to ensure that only authorized personnel can access your personal information, and only when necessary for business purposes.",
        },
        {
          subtitle: "Regular Audits",
          text: "We regularly conduct security audits and assessments to identify and address potential vulnerabilities in our systems.",
        },
      ],
    },
  ]

  const highlights = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bank-Grade Security",
      description: "Your data is protected with the same security standards used by major financial institutions.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Read-Only Access",
      description:
        "We only have read-only access to your financial data - we cannot make transactions or changes to your accounts.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Transparent Practices",
      description: "We're committed to being transparent about how we collect, use, and protect your information.",
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
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-zinc-400">How we collect, use, and protect your information</p>
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

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Your Privacy</h2>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                At moulai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our tax deduction tracking service. We are committed to
                protecting your personal and financial information with the highest standards of security and
                transparency.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                    <div className="text-[#BEF397] mb-2">{highlight.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{highlight.title}</h3>
                    <p className="text-zinc-400 text-sm">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="text-[#BEF397]">{section.icon}</div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <h4 className="text-lg font-semibold text-white mb-3">{item.subtitle}</h4>
                        <p className="text-zinc-300 leading-relaxed">{item.text}</p>
                        {itemIndex < section.content.length - 1 && <Separator className="mt-6 bg-zinc-700" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#BEF397]" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Access and Correction</h4>
                  <p className="text-zinc-300 mb-4">
                    You have the right to access, update, or correct your personal information at any time through your
                    account settings.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Data Deletion</h4>
                  <p className="text-zinc-300 mb-4">
                    You can request deletion of your personal information, subject to certain legal and business
                    requirements.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Opt-Out</h4>
                  <p className="text-zinc-300 mb-4">
                    You can opt out of promotional communications at any time by following the unsubscribe instructions
                    in our emails.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Data Portability</h4>
                  <p className="text-zinc-300 mb-4">
                    You can request a copy of your data in a portable format to transfer to another service provider.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-[#BEF397]/10 to-[#7DD3FC]/10 border border-[#BEF397]/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Questions About Your Privacy?</h3>
              <p className="text-zinc-300 mb-6">
                If you have any questions about this Privacy Policy or our privacy practices, please don't hesitate to
                contact us.
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
                  privacy@moulai.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
