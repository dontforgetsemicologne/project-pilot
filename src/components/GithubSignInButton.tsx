'use client'

import { Github } from "lucide-react";
import { Button } from "./ui/button";

import { signIn } from 'next-auth/react'

export default function GithubSignInButton() {
  return (
    <Button 
        variant="outline" 
        className="w-72"
        onClick={() => signIn("github")}
    >
        <Github/>
        Login with GitHub
    </Button>
  )
}
