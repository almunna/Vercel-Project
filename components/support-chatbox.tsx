"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Mail, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SupportChatbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"initial" | "form" | "sent">("initial")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !message.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("📤 Submitting support request...")

      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          message: message.trim(),
        }),
      })

      const data = await response.json()
      console.log("📧 Support API response:", data)

      if (data.success) {
        console.log("✅ Support request submitted successfully:", data.requestId)
        setStep("sent")
      } else {
        throw new Error(data.error || "Failed to submit support request")
      }
    } catch (error) {
      console.error("❌ Error submitting support request:", error)
      setError(error instanceof Error ? error.message : "Failed to submit support request")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep("initial")
    setEmail("")
    setName("")
    setMessage("")
    setLoading(false)
    setError(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetForm, 300) // Reset after animation completes
  }

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
            >
              <Card className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">Need Help?</CardTitle>
                        <p className="text-zinc-400 text-sm">We're here to assist you</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {error && (
                    <Alert className="mb-4 border-red-800 bg-red-900/20">
                      <AlertDescription className="text-red-300">{error}</AlertDescription>
                    </Alert>
                  )}

                  {step === "initial" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <p className="text-zinc-300 text-sm">
                        Have a question or need support? Send us a message and we'll get back to you as soon as
                        possible.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <CheckCircle className="w-3 h-3 text-[#BEF397]" />
                          <span>Usually respond within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <CheckCircle className="w-3 h-3 text-[#BEF397]" />
                          <span>Technical support & account help</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <CheckCircle className="w-3 h-3 text-[#BEF397]" />
                          <span>Feature requests & feedback</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setStep("form")}
                        className="w-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Start Conversation
                        <MessageCircle className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}

                  {step === "form" && (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="support-email" className="text-white text-sm font-medium">
                          Email Address *
                        </Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            id="support-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#BEF397]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="support-name" className="text-white text-sm font-medium">
                          Name (Optional)
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            id="support-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#BEF397]"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="support-message" className="text-white text-sm font-medium">
                          Message *
                        </Label>
                        <Textarea
                          id="support-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="How can we help you? Please describe your issue or question in detail..."
                          className="mt-1 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#BEF397] resize-none"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep("initial")}
                          className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || !email.trim() || !message.trim()}
                          className="flex-1 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                          {loading ? (
                            "Sending..."
                          ) : (
                            <>
                              Send Message
                              <Send className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {step === "sent" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-[#BEF397]/20 to-[#7DD3FC]/20 rounded-full flex items-center justify-center mx-auto border border-[#BEF397]/30">
                        <CheckCircle className="w-8 h-8 text-[#BEF397]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Message Sent!</h3>
                        <p className="text-zinc-400 text-sm">
                          Thanks for reaching out. We'll get back to you at{" "}
                          <span className="text-[#BEF397]">{email}</span> within 24 hours.
                        </p>
                      </div>
                      <Button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black font-medium"
                      >
                        Close
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
