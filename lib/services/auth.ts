import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { connectToDatabase } from "../mongodb"
import type { User, CreateUserData, LoginCredentials, UserResponse } from "../models/user"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours

export class AuthService {
  private static instance: AuthService
  private dbPromise = connectToDatabase()

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

private async getUsersCollection() {
  const { db } = await this.dbPromise
  return db.collection<User>("users")
}

  // Validation helpers
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  public verifyJWT(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
      return null
    }
  }

  private generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  private formatUserResponse(user: User): UserResponse {
    return {
      id: user._id!.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile || user.phone,
      phone: user.phone,
      subscription: user.subscription,
      preferences: user.preferences,
      profile: user.profile,
      settings: user.settings,
      emailVerified: user.emailVerified || user.isEmailVerified,
      isEmailVerified: user.isEmailVerified || user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    }
  }

  // Check if account is locked
  private isAccountLocked(user: User): boolean {
    return !!(user.lockUntil && user.lockUntil > new Date())
  }

  // Increment login attempts
  private async incrementLoginAttempts(userId: ObjectId): Promise<void> {
    const users = await this.getUsersCollection()
    const user = await users.findOne({ _id: userId })

    if (!user) return

    const updates: any = {
      $inc: { loginAttempts: 1 },
      $set: { updatedAt: new Date() },
    }

    // If we have a previous lock that has expired, restart at 1
    if (user.lockUntil && user.lockUntil <= new Date()) {
      updates.$set.loginAttempts = 1
      updates.$unset = { lockUntil: 1 }
    }
    // If we're at max attempts and not locked yet, lock the account
    else if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !user.lockUntil) {
      updates.$set.lockUntil = new Date(Date.now() + LOCK_TIME)
    }

    await users.updateOne({ _id: userId }, updates)
  }

  // Reset login attempts
  private async resetLoginAttempts(userId: ObjectId): Promise<void> {
    const users = await this.getUsersCollection()
    await users.updateOne(
      { _id: userId },
      {
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      },
    )
  }

  // Sign up new user
  async signUp(userData: CreateUserData): Promise<{ user: UserResponse; token: string; message: string }> {
    const users = await this.getUsersCollection()

    // Validate input
    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required")
    }

    if (!this.validateEmail(userData.email)) {
      throw new Error("Please provide a valid email address")
    }

    const passwordValidation = this.validatePassword(userData.password)
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(", ")}`)
    }

    // Check if user already exists
    const existingUser = await users.findOne({ email: userData.email.toLowerCase() })
    if (existingUser) {
      throw new Error("An account with this email already exists")
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password)

    // Generate email verification token
    const emailVerificationToken = this.generateEmailVerificationToken()

    // Create user document
    const now = new Date()
    const newUser: User = {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobile: userData.phone,
      phone: userData.phone,
      subscription: {
        plan: "free",
        status: "active",
        startDate: now,
      },
      preferences: {
        currency: "AUD",
        taxYear: "2023-24",
        notifications: true,
        theme: "dark",
      },
      profile: {
        onboarding: {
          completed: false,
          step: 1,
          deductionTypes: [],
          selectedAccounts: [],
        },
      },
      settings: {
        deductionToggles: {},
        manualOverrides: {},
        notifications: true,
        autoSync: true,
      },
      emailVerified: false,
      isEmailVerified: false,
      emailVerificationToken,
      loginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    }

    // Insert user
    const result = await users.insertOne(newUser)
    newUser._id = result.insertedId

    // Generate JWT token
    const token = this.generateToken(result.insertedId.toString())

    return {
      user: this.formatUserResponse(newUser),
      token,
      message: "Account created successfully. Please check your email to verify your account.",
    }
  }

  // Sign in existing user - this is the authenticateUser function
  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = await this.getUsersCollection()

    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    if (!this.validateEmail(email)) {
      throw new Error("Please provide a valid email address")
    }

    // Find user
    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Check if account is locked
    if (this.isAccountLocked(user)) {
      const lockTimeRemaining = Math.ceil((user.lockUntil!.getTime() - Date.now()) / (1000 * 60))
      throw new Error(`Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`)
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password!)
    if (!isPasswordValid) {
      await this.incrementLoginAttempts(user._id!)
      throw new Error("Invalid email or password")
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user._id!)

    // Generate JWT token
    const token = this.generateToken(user._id!.toString())

    return { user, token }
  }

  // Sign in existing user (alias for authenticateUser)
  async signIn(credentials: LoginCredentials): Promise<{ user: UserResponse; token: string; message: string }> {
    const { user, token } = await this.authenticateUser(credentials.email, credentials.password)

    return {
      user: this.formatUserResponse(user),
      token,
      message: "Signed in successfully",
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<UserResponse> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      const users = await this.getUsersCollection()

      const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
      if (!user) {
        throw new Error("User not found")
      }

      return this.formatUserResponse(user)
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getUsersCollection()
    const user = await users.findOne({ _id: new ObjectId(userId) })
    return user
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: any): Promise<User | null> {
    const users = await this.getUsersCollection()

    const updateData: any = {
      updatedAt: new Date(),
    }

    // Handle direct field updates
    if (updates.firstName) updateData.firstName = updates.firstName
    if (updates.lastName) updateData.lastName = updates.lastName
    if (updates.email) updateData.email = updates.email
    if (updates.phone) updateData.phone = updates.phone

    // Handle nested updates for preferences
    if (updates.preferences) {
      updateData.preferences = updates.preferences
    }

    // Handle nested updates for profile/onboarding
    if (updates.profile) {
      updateData.profile = updates.profile
    }

    // Handle onboarding updates directly
    if (updates.onboarding) {
      updateData["profile.onboarding"] = updates.onboarding
    }

    // Handle salary and tax information in preferences
    if (updates.salary !== undefined) {
      updateData["preferences.salary"] = updates.salary
    }

    if (updates.taxBracket !== undefined) {
      updateData["preferences.taxBracket"] = updates.taxBracket
    }

    if (updates.estimatedTax !== undefined) {
      updateData["preferences.estimatedTax"] = updates.estimatedTax
    }

    console.log("AuthService updateUserProfile - updateData:", updateData)

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: "after" },
    )

    return result
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const users = await this.getUsersCollection()

    // Get user
    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw new Error("User not found")
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password!)
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect")
    }

    // Validate new password
    const passwordValidation = this.validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(", ")}`)
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword)

    // Update password
    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      },
    )
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<string> {
    const users = await this.getUsersCollection()

    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if email exists or not
      return "If an account with this email exists, you will receive a password reset link."
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          updatedAt: new Date(),
        },
      },
    )

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken)

    return "If an account with this email exists, you will receive a password reset link."
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const users = await this.getUsersCollection()

    // Find user with valid reset token
    const user = await users.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!user) {
      throw new Error("Invalid or expired password reset token")
    }

    // Validate new password
    const passwordValidation = this.validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(", ")}`)
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword)

    // Update password and clear reset token
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1,
          loginAttempts: 1,
          lockUntil: 1,
        },
      },
    )
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const users = await this.getUsersCollection()

    const user = await users.findOne({ emailVerificationToken: token })
    if (!user) {
      throw new Error("Invalid email verification token")
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          isEmailVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          emailVerificationToken: 1,
        },
      },
    )
  }

  async createOrGetUser(email: string, mobile: string): Promise<User> {
    const users = await this.getUsersCollection()

    // Check if user exists
    const user = await users.findOne({ email: email.toLowerCase() })

    if (user) {
      // Update mobile if different
      if (user.mobile !== mobile) {
        await users.updateOne({ _id: user._id! }, { $set: { mobile, updatedAt: new Date() } })
        user.mobile = mobile
      }
      return user
    }

    // Create new user
    const now = new Date()
    const newUserData: User = {
      email: email.toLowerCase(),
      mobile,
      subscription: {
        plan: "free",
        status: "active",
        startDate: now,
      },
      preferences: {
        currency: "AUD",
        taxYear: "2023-24",
        notifications: true,
        theme: "dark",
      },
      profile: {
        onboarding: {
          completed: false,
          step: 1,
          deductionTypes: [],
          selectedAccounts: [],
        },
      },
      settings: {
        deductionToggles: {},
        manualOverrides: {},
        notifications: true,
        autoSync: true,
      },
      emailVerified: false,
      isEmailVerified: false,
      loginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    }

    const result = await users.insertOne(newUserData)
    newUserData._id = result.insertedId

    return newUserData
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const db = await this.db
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password!, 12)

    const newUser: Omit<User, "_id"> = {
      email: userData.email!,
      password: hashedPassword,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone,
      isEmailVerified: false,
      emailVerified: false,
      loginAttempts: 0,
      subscription: {
        plan: "free",
        status: "active",
        startDate: new Date(),
      },
      connectedAccounts: [],
      preferences: {
        currency: "AUD",
        taxYear: "2023-24",
        notifications: true,
        theme: "dark",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const db = await this.db
    const users = db.collection<User>("users")

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
    )

    return result
  }

  private createToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
  }

  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  }
}

export const authService = AuthService.getInstance()
