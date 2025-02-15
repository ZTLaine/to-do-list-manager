import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">TodoNext</span>
        </h1>
        <p className="mt-3 text-2xl">Get things done with our powerful todo app</p>
        <div className="flex mt-6">
          <Link href="/login" passHref>
            <Button className="mr-4">Login</Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="outline">Register</Button>
          </Link>
        </div>
        <div className="mt-6 text-xl">
          <h2 className="font-semibold">Our Features:</h2>
          <ul className="mt-2 list-disc list-inside">
            <li>Create and manage tasks</li>
            <li>Organize tasks into projects</li>
            <li>Set due dates and priorities</li>
            <li>Collaborate with team members</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

