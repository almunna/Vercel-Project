import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"
import nodemailer from "nodemailer"

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  console.log("🔧 Creating SMTP transporter for password reset...")

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add these for better Gmail compatibility
    tls: {
      rejectUnauthorized: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    console.log("🔐 Password reset requested for:", email)

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ SMTP not configured - missing SMTP_USER or SMTP_PASS")

      // For development, still generate the token and log it
      const authService = AuthService.getInstance()
      await authService.requestPasswordReset(email)

      const users = await authService.getUsersCollection()
      const user = await users.findOne({ email: email.toLowerCase() })

      if (user && user.passwordResetToken) {
        console.log("🔗 Reset link for development (SMTP not configured):")
        console.log(`http://localhost:3000/reset-password/${user.passwordResetToken}`)
        console.log("⚠️  Configure SMTP to send actual emails!")
      }

      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    const authService = AuthService.getInstance()
    const message = await authService.requestPasswordReset(email)

    // Get the user to find the reset token for email sending
    const users = await authService.getUsersCollection()
    const user = await users.findOne({ email: email.toLowerCase() })

    if (user && user.passwordResetToken) {
      try {
        console.log("📤 Sending password reset email...")
        const transporter = createTransporter()

        // Test the connection first
        await transporter.verify()
        console.log("✅ SMTP connection verified successfully")

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password/${user.passwordResetToken}`

        // Password reset email
        const emailOptions = {
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to: email,
          subject: "🔐 Reset Your Password - moulai.",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
              <div style="background: linear-gradient(135deg, #BEF397, #7DD3FC); padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
                <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: bold;">🔐 Reset Your Password</h1>
                <p style="color: #333; margin: 10px 0 0 0; font-size: 16px;">Secure your moulai account</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                  <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Hi there! 👋</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.5;">We received a request to reset your password for your moulai account.</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #BEF397;">
                  <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🔗 Reset Your Password</h3>
                  <p style="margin: 0 0 20px 0; color: #555; line-height: 1.6;">Click the button below to create a new password. This link will expire in 1 hour for security.</p>
                  
                  <div style="text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #BEF397, #7DD3FC); color: #000; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Reset My Password
                    </a>
                  </div>
                </div>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border: 1px solid #ffeaa7; margin: 25px 0;">
                  <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Security Notice</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.6;">
                    <li>This link expires in 1 hour</li>
                    <li>If you didn't request this, you can safely ignore this email</li>
                    <li>Never share this link with anyone</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                  <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Can't click the button? Copy and paste this link:</p>
                  <p style="margin: 0; color: #007bff; font-size: 12px; word-break: break-all; font-family: monospace;">${resetUrl}</p>
                </div>
                
                <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    This email was sent by moulai. If you have questions, contact our support team.
                  </p>
                </div>
              </div>
            </div>
          `,
        }

        console.log("📤 Sending password reset email to:", email)
        const emailResult = await transporter.sendMail(emailOptions)
        console.log("✅ Password reset email sent successfully:", emailResult.messageId)
      } catch (emailError) {
        console.error("❌ Error sending password reset email:", emailError)

        // Still log the reset URL for development if email fails
        console.log("🔗 Reset link for development (email failed):")
        console.log(`http://localhost:3000/reset-password/${user.passwordResetToken}`)

        // Don't return error - we don't want to reveal if email exists
        // Just log the error and continue
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process password reset request",
      },
      { status: 500 },
    )
  }
}
