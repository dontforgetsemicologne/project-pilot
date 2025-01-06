'use client'

import { 
  Dialog, 
  DialogContent,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import GithubSignInButton from "./GithubSignInButton";

export default function DialogLoginForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'signin'}
          size={'signin'}
        >
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col min-h-[420px] max-w-sm items-center justify-center p-2 md:p-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Login to your account</DialogTitle>
        </DialogHeader>
        <form className="gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-md font-bold">Project Management Made Simple</p>
            <p className="text-sm text-muted-foreground">
              Streamline your workflow with Project Pilot
            </p>
          </div>
          <div className="grid gap-6 w-full mt-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com"/>
            </div>
            <Button 
              type="submit"
              className="w-full"
              variant={'login'}
              size={'login'}
            >
              Login
            </Button>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </form>
        <GithubSignInButton/>
      </DialogContent>
    </Dialog>
  );
}