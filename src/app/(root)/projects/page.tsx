'use client'

import Link from "next/link"

import { api } from "@/trpc/react"

import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent, 
    CardDescription
} from "@/components/ui/card";

export default function ProjectsPage() {
    const getProjects = api.project.getAll.useQuery();
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">Projects</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
                getProjects.data?.map((project) => (
                <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="transition-transform hover:scale-105"
                >
                    <Card className="h-full">
                    <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        {project.description && (
                        <CardDescription>{project.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                        <p className="text-sm">
                            Start Date: {project.startDate.toLocaleDateString()}
                        </p>
                        {project.endDate && (
                            <p className="text-sm">
                            End Date: {project.endDate.toLocaleDateString()}
                            </p>
                        )}
                        <p className="text-sm">
                            Team Members: {project.members.length}
                        </p>
                        </div>
                    </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
    )
}
