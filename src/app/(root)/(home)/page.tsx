import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Dashboard from "@/components/DashBoard";

export default async function Home() {
  const session = await auth();
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Dashboard/>
      </main>
    </HydrateClient>
  );
}
