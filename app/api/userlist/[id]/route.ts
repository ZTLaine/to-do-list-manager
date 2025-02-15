import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const userList = await prisma.userList.findUnique({
    where: { id: params.id },
    include: { tasks: true },
  })

  if (!userList) {
    return NextResponse.json({ message: "UserList not found" }, { status: 404 })
  }

  return NextResponse.json(userList)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { name } = await req.json()

  const updatedUserList = await prisma.userList.update({
    where: { id: params.id },
    data: { name },
  })

  return NextResponse.json(updatedUserList)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  await prisma.userList.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ message: "UserList deleted successfully" })
}