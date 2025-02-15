import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { taskName, isCompleted } = await req.json()
  const data: any = {}

  if (taskName !== undefined) data.taskName = taskName
  if (isCompleted !== undefined) data.isCompleted = isCompleted

  const updatedTask = await prisma.task.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(updatedTask)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  await prisma.task.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ message: "Task deleted successfully" })
}