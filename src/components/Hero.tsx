'use client'

import { ChevronRight } from "lucide-react"

import { LinkPreview } from "@/components/ui/link-preview"

import RetroGrid from "@/components/RetroGrid"
import DialogLoginForm from "@/components/DialogLoginForm"
import Image from "next/image"

export default function Hero() {
    return (
        <div className="relative w-full overflow-x-hidden">
            <div className="absolute top-0 z-[0] h-full w-full bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <section className="relative w-full mx-auto z-1">
                <RetroGrid/>
                <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 text-gray-600 md:px-8">
                    <div className="space-y-5 max-w-3xl mx-auto text-center">
                        <h1 className="text-sm text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent border-[2px] border-white/5 rounded-3xl w-fit">
                            Modern Project Management
                            <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
                        </h1>
        
                        <h2 className="text-4xl tracking-tighter font-geist bg-clip-text bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] text-transparent mx-auto md:text-6xl">
                            Streamline your workflow with{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-200">
                                Project Pilot
                            </span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-gray-300">
                            A powerful project management platform built with cutting-edge technology. Featuring intuitive task tracking, real-time collaboration, and customizable dashboards to keep your team synchronized and productive.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-sm font-medium text-gray-50 backdrop-blur-3xl">
                                    <DialogLoginForm/>
                                </div>
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <LinkPreview url="https://nextjs.org/">
                                <span className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full">Next.js</span>
                            </LinkPreview>
                            <LinkPreview url="https://trpc.io/">
                                <span className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full">tRPC</span>
                            </LinkPreview>
                            <LinkPreview url="https://tailwindcss.com/">
                                <span className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full">Tailwind CSS</span>
                            </LinkPreview>
                            <LinkPreview url="https://www.prisma.io/">
                                <span className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full">Prisma</span>
                            </LinkPreview>
                            <LinkPreview url="https://supabase.com/">
                                <span className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full">Supabase</span>
                            </LinkPreview>
                            <LinkPreview url="https://aws.amazon.com/">
                                <span className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full">AWS</span>
                            </LinkPreview>
                        </div>
                    </div>
                    <div className="mt-14 mx-auto max-w-full px-4">
                        <Image
                            src="https://farmui.vercel.app/dashboard.png"
                            className="w-full shadow-lg rounded-lg border"
                            alt="Dashboard preview"
                            width={5000}
                            height={5000}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}
