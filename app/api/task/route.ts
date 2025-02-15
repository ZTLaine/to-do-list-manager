import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { taskName, userListId } = await req.json()

  const task = await prisma.task.create({
    data: {
      taskName,
      userListId,
    },
  })

  return NextResponse.json(task, { status: 201 })
}

