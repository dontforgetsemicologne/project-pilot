'use client'

import { notFound, useParams } from "next/navigation";

import { api } from "@/trpc/react";

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const getProject = api.project.getById.useQuery({ id: projectId });

  if(!getProject) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{getProject.data?.name}</CardTitle>
          {getProject.data?.description && (
            <p className="text-gray-600 mt-2">{getProject.data?.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Project Details</h3>
              <div className="space-y-2">
                <p>Start Date: {getProject.data?.startDate?.toLocaleDateString() || "Not available"}</p>
                {getProject.data?.endDate && (
                  <p>End Date: {getProject.data?.endDate.toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Team Members</h3>
              <div className="space-y-2">
                {getProject.data?.members.map((member) => (
                  <div key={member.id} className="p-2 rounded">
                    {member.name ?? member.id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(getProject.data?.teams.length ?? 0) > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getProject.data?.teams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Members: {team.members.length}</p>
                      <p>Tasks: {team.tasks.length}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
