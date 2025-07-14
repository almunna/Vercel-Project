import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/middleware/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { User } from "@/lib/models/user"

export async function PATCH(request: NextRequest) {
  try {
    console.log("Profile PATCH request received")

    const { userId, user } = await authenticateRequest(request)
    console.log("User authenticated:", userId)

    const body = await request.json()
    console.log("Request body:", body)

    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Prepare the update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Handle salary and tax information
    if (body.salary !== undefined) {
      updateData["preferences.salary"] = body.salary
    }

    if (body.taxBracket !== undefined) {
      updateData["preferences.taxBracket"] = body.taxBracket
    }

    if (body.estimatedTax !== undefined) {
      updateData["preferences.estimatedTax"] = body.estimatedTax
    }

    // Handle other profile fields
    if (body.firstName) {
      updateData.firstName = body.firstName
    }

    if (body.lastName) {
      updateData.lastName = body.lastName
    }

    if (body.phone) {
      updateData.phone = body.phone
    }

    console.log("Update data:", updateData)

    // Update the user
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      console.error("User not found for update")
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    console.log("User updated successfully")

    // Format user response
    const userResponse = {
      id: result._id!.toString(),
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      phone: result.phone,
      mobile: result.mobile,
      preferences: result.preferences,
      subscription: result.subscription,
      createdAt: result.createdAt,
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, user } = await authenticateRequest(request)

    const userResponse = {
      id: user._id!.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      mobile: user.mobile,
      preferences: user.preferences,
      subscription: user.subscription,
      createdAt: user.createdAt,
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 401 },
    )
  }
}
