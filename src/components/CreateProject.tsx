'use client'

import { 
    Dialog, 
    DialogContent,
    DialogFooter,
    DialogHeader, 
    DialogTitle, 
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { api } from "@/trpc/react";
import DateTimePicker from "@/components/ui/data-time-picker";

import { z } from 'zod'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import MultiFunction from "@/components/ui/multi-select";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    startDate: z.date({
      required_error: "Date & time is required!",
    }),
    endDate: z.date().optional(),
    members: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProjectProps {
    userId: string;
    userName: string;
}

export default function CreateProject({ userId, userName }: CreateProjectProps) {
    const [open, setOpen] = useState(false);
    const addProject = api.project.create.useMutation();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            members: [],
            description: '',
        }
    });

    const onSubmit = async(data: FormValues) => {
        try {
            await addProject.mutateAsync(data);
            setOpen(false);
            form.reset();
        } catch(error) {
            console.error(error);
        }
    }
    const startDate = form.watch('startDate');
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button variant={'none'} size={'none'}><Plus/></Button>
            </DialogTrigger>
            <DialogContent className="p-4">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="Name of your project" 
                                    {...form.register("name")}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                    id="description" 
                                    placeholder="Project Description" 
                                    {...form.register('description')}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5 gap-3">
                                <DateTimePicker name="startDate" label="Start Date"/>
                                <DateTimePicker name="endDate" label="End Date" minDate={startDate}/>
                            </div>
                            <div className="flex flex-col space-y-1.5 gap-3">
                                <MultiFunction id={userId} name={userName}/>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between">
                            <Button 
                                variant="outline" 
                                type="button" 
                                onClick={() => {
                                    form.reset();
                                    setOpen(false);
                                }}>Clear</Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
