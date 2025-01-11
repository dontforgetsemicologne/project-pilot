"use client"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { api } from "@/trpc/react"
import { Textarea } from "@/components/ui/textarea"
import { useAutosizeTextArea } from "@/components/ui/autosize-textarea"
import { MultiSelect } from "@/components/ui/multiple-select"
import { Dot, ShieldAlert } from "lucide-react"
import TagCreator from "@/components/TagCreator"

const formSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    teamId: z.string().min(1),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default('MEDIUM'),
    startDate: z.date(),
    deadline: z.date(),
    assignees: z.array(z.string().min(1)),
    tags: z.array(z.object({
        id: z.string(),
        label: z.string(),
        color: z.string().optional()
    })).default([]),
})

export default function MyForm() {
    const addTask = api.task.create.useMutation({});
    const projects = api.project.getAll.useQuery();
    const createTeam = api.team.create.useMutation({});
    const tags = api.tag.getAll.useQuery();
    const createTag = api.tag.create.useMutation();

    const form = useForm<z.infer<typeof formSchema>> ({
        resolver: zodResolver(formSchema),
    });

    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const selectedProject = projects.data?.find(project => project.id === selectedProjectId);

    const members = selectedProject?.members.map(member => ({
        label: member.name ?? member.email ?? 'Unknown User',
        value: member.id,
        icon: member.image ?? undefined
    })) ?? [];

    const tagSuggestions = tags.data?.map(tag => ({
        id: tag.id,
        label: tag.name,
        color: tag.color ?? ''
    })) ?? [];

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [triggerAutoSize, setTriggerAutoSize] = useState('');
    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: triggerAutoSize,
      minHeight: 52,
      maxHeight: 200,
    });

    const description = form.watch('description');
    const assignees = form.watch('assignees');

    useEffect(() => {
        if(textAreaRef.current) {
            setTriggerAutoSize(description ?? '');
        }
    },[description]);

    const handleTeamAssignment = async() => {
        if (!selectedProjectId || !assignees?.length) return;

        const existingTeam = selectedProject?.teams?.find(team => 
            team.members.length === assignees.length && 
            team.members.every(member => assignees.includes(member.id))
        );

        if (existingTeam) {
            // Use existing team
            form.setValue('teamId', existingTeam.id);
            return existingTeam.id;
        } else {
            // Create new team
            const newTeam = await   createTeam.mutateAsync({
                name: `Task Team for ${selectedProject?.name}`,
                projectId: selectedProjectId,
                members: assignees
            });
            form.setValue('teamId', newTeam.id);
            return newTeam.id;
        }
    };

    const getPriorityContent = (priority: string) => {
        const priorityConfig = {
            LOW: { 
                icon: 
                    <Dot 
                        className="text-green-500 mr-2" 
                        width={10}
                        height={10}
                        strokeWidth={20}
                    />, 
                label: "LOW",
                classname: 'border border-emerald-300 bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/30 p-2 shadow-sm'
            },
            MEDIUM: { 
                icon: 
                    <Dot 
                        className="text-yellow-500 mr-2" 
                        width={10}
                        height={10}
                        strokeWidth={20}
                    />, 
                label: "MEDIUM",
                classname: 'border border-yellow-300 bg-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-800/30 p-2 shadow-sm'
            },
            HIGH: { 
                icon: 
                    <Dot 
                        className="text-red-500 mr-2" 
                        width={10}
                        height={10}
                        strokeWidth={20}
                    />, 
                label: "HIGH", 
                classname: 'border border-rose-300 bg-rose-100 dark:bg-rose-950/20 dark:border-rose-800/30 p-2 shadow-sm'
            },
            URGENT: { 
                icon: 
                    <ShieldAlert 
                        className="text-red-500 mr-2" 
                        width={10}
                        height={10}
                    />, 
                label: "URGENT", 
                classname: 'border border-red-300 bg-red-100 dark:bg-red-950/20 dark:border-red-800/30 p-2 shadow-sm'
            }
        };
        return priorityConfig[priority as keyof typeof priorityConfig];
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const teamId = await handleTeamAssignment();
            if (!teamId) {
                toast.error("Failed to create or assign team");
                return;
            }

            addTask.mutate(values);
            const newTags = values.tags.filter(tag => !tagSuggestions.find(s => s.id === tag.id));

            const createdTags = await Promise.all(
                newTags.map(tag => 
                createTag.mutateAsync({
                    name: tag.label,
                    color: tag.color
                })
            ));

            const allTags = [
                ...values.tags.filter(tag => tagSuggestions.find(s => s.id === tag.id)),
                ...createdTags.map(tag => ({
                    id: tag.id,
                    label: tag.name,
                    color: tag.color ?? '' 
                }))
            ];

            await addTask.mutateAsync({
                ...values,
                teamId,
                tags: allTags
            })

            toast(
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(values, null, 2)}</code>
                </pre>
            );

        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10"> 
                <div className="flex flex-col gap-3">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Title of the task" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> 
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descriptiom</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Description of the Task"
                                        {...field} 
                                        ref={textAreaRef}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select the task priority'>
                                                {field.value && (
                                                    <div className="flex items-center">
                                                        {getPriorityContent(field.value).icon}
                                                        {getPriorityContent(field.value).label}
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                                            <SelectItem 
                                                key={priority} 
                                                value={priority}
                                                className={`flex items-center gap-1 ${getPriorityContent(priority).classname}`}
                                            >
                                                <div className="flex items-center">
                                                    {getPriorityContent(priority).icon}
                                                    {getPriorityContent(priority).label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project</FormLabel>
                                <Select 
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setSelectedProjectId(value);
                                        form.setValue('assignees',[]);
                                    }} 
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select the project'/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {
                                            projects.data?.map((project) => (
                                                <SelectItem 
                                                    key={project.id} 
                                                    value={project.id}
                                                >
                                                    {project.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="assignees"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assignees</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={members}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder="Select assignees"
                                        animation={0}
                                        maxCount={10}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deadline</FormLabel>
                                <FormControl>
                                </FormControl>
                            </FormItem>
                        )}
                    /> */}
                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <TagCreator
                                        onChange={field.onChange}
                                        defaultTags={field.value}
                                        suggestions={tagSuggestions}
                                        maxTags={10}
                                        placeholder="Add tags..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-4 justify-end">
                        <Button type="reset">Clear</Button>
                        <Button type="submit">Submit</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}