import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userLists = await prisma.userList.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    include: {
      tasks: true,
    },
  })

  return NextResponse.json(userLists)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { name } = await req.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  const userList = await prisma.userList.create({
    data: {
      name,
      userId: user.id,
    },
  })

  return NextResponse.json(userList, { status: 201 })
}

