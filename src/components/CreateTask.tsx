'use client'

import { z } from 'zod'
import { useState } from 'react';
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
import { api } from '@/trpc/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Plus } from 'lucide-react';
import SelectProject from '@/components/SelectProject';

const formSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    teamId: z.string().min(1),
    projectId: z.string().min(1),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    startDate: z.date({
        required_error: "Date & time is required!",
    }),
    deadline: z.date({
        required_error: "Date & time is required!",
    }),
    assignees: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateTask() {
    const [open, setOpen] = useState(false);
    // const addTask = api.task.create.useMutation();
    // const getProjects = api.project.getAll.useQuery();

    const form = useForm<FormValues>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                priority: 'MEDIUM',
                description: '',
                assignees: [],
                tags: [],
            }
    });
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button variant={'none'} size={'none'}><Plus/></Button>
            </DialogTrigger>
            <DialogContent className="p-4">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create task</DialogTitle>
                    <FormProvider {...form}>
                        <form className="space-y-4">
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="title">Title</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="Title of the task" 
                                        {...form.register("title")}
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Input 
                                        id="description" 
                                        placeholder="Description of the task" 
                                        {...form.register("description")}
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5 gap-3">
                                    <SelectProject/>
                                </div>
                            </div>
                        </form>
                    </FormProvider>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
