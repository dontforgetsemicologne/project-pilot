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
import { Task } from "./types"
import DateTimePicker from "@/components/ui/data-time-picker"

const formSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1),
    teamId: z.string().optional(    ),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default('MEDIUM'),
    status: z.enum(["PENDING","IN_PROGRESS","REVIEW","COMPLETED"]).default('PENDING'),
    startDate: z.date(),
    deadline: z.date(),
    assignees: z.array(z.string().min(1)),
    tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
    })).default([]),
});

interface MyFormProps {
    defaultValues?: Partial<z.infer<typeof formSchema>>;
    onSuccess?: () => void;
}

export default function MyForm({ defaultValues, onSuccess }: MyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof formSchema>> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...defaultValues,
            title: defaultValues?.title ?? "",
            description: defaultValues?.description ?? "",
            projectId: defaultValues?.projectId ?? "",
            teamId: defaultValues?.teamId ?? "",
            priority: defaultValues?.priority ?? "MEDIUM" as const,
            status: defaultValues?.status ?? "PENDING" as const,
            startDate: defaultValues?.startDate ?? new Date(),
            deadline: defaultValues?.deadline ?? new Date(),
            assignees: defaultValues?.assignees ?? [],
            tags: defaultValues?.tags ?? []
        },
        mode: 'onChange'
    });

    const addTask = api.task.create.useMutation({
        onSuccess: () => {
            console.log("Task created successfully");
            toast.success("Task created successfully");
            form.reset();
            onSuccess?.();
        },
        onError: (error) => {
            console.error("Error creating task:", error);
            toast.error(error.message || "Failed to create task");
        }
    });

    const updateTask = api.task.update.useMutation({
        onSuccess: () => {
            toast.success("Task updated successfully");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update task");
        }
    });

    const projects = api.project.getAll.useQuery();
    const createTeam = api.team.create.useMutation({});
    const tags = api.tag.getAll.useQuery();
    const createTag = api.tag.create.useMutation({
        onError: (error) => {
            toast.error(error.message || "Failed to create team");
        }
    });

    const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultValues?.projectId ?? '');
    const selectedProject = projects.data?.find(project => project.id === selectedProjectId);

    const members = selectedProject?.members.map(member => ({
        label: member.name ?? member.email ?? 'Unknown User',
        value: member.id,
        icon: member.image ?? undefined
    })) ?? [];

    const tagSuggestions = tags.data?.map(tag => ({
        id: tag.id,
        name: tag.name,
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
    const startDate = form.watch('startDate');

    useEffect(() => {
        if(textAreaRef.current) {
            setTriggerAutoSize(description ?? '');
        }
    },[description]);

    const getStatusContent = (status: string) => {
        const statusConfig = {
            PENDING: {
                classname: "bg-gray-200 text-gray-700",
                label: 'Pending'
            },
            IN_PROGRESS: {
                classname: "bg-blue-200 text-blue-700",
                label: 'In Progress'
            },
            REVIEW: {
                classname: "bg-yellow-200 text-yellow-700",
                label: 'Review'
            },
            COMPLETED: {
                classname: "bg-green-200 text-green-700",
                label: 'Completed'
            },
        }
        return statusConfig[status as keyof typeof statusConfig];
    }

    const getPriorityContent = (priority: string) => {
        const priorityConfig = {
            LOW: { 
                icon: <Dot className="text-green-500 mr-2" width={10} height={10} strokeWidth={20} />, 
                label: "LOW",
                classname: 'border border-emerald-300 bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/30 p-2 shadow-sm'
            },
            MEDIUM: { 
                icon: <Dot className="text-yellow-500 mr-2" width={10} height={10} strokeWidth={20} />, 
                label: "MEDIUM",
                classname: 'border border-yellow-300 bg-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-800/30 p-2 shadow-sm'
            },
            HIGH: { 
                icon: <Dot className="text-red-500 mr-2" width={10} height={10} strokeWidth={20} />, 
                label: "HIGH", 
                classname: 'border border-rose-300 bg-rose-100 dark:bg-rose-950/20 dark:border-rose-800/30 p-2 shadow-sm'
            },
            URGENT: { 
                icon: <ShieldAlert className="text-red-500 mr-2" width={10} height={10} />, 
                label: "URGENT", 
                classname: 'border border-red-300 bg-red-100 dark:bg-red-950/20 dark:border-red-800/30 p-2 shadow-sm'
            }
        };
        return priorityConfig[priority as keyof typeof priorityConfig];
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('Starting form submission with values:', values);
        setIsSubmitting(true);

        try {
            if (!values.projectId) {
                toast.error("Project is required");
                return;
            }

            if (!values.assignees || values.assignees.length === 0) {
                toast.error("At least one assignee is required");
                return;
            }

            console.log('Selected Project:', selectedProject);
            console.log('Current Assignees:', assignees);

            // First, try to find an existing team
            let teamId: string | undefined;
            const existingTeam = selectedProject?.teams?.find(team => {
                const hasAllAssignees = values.assignees.every(assigneeId => 
                    team.members.some(member => member.id === assigneeId)
                );
                const teamHasOnlySelectedMembers = team.members.every(member => 
                    values.assignees.includes(member.id)
                );
                return hasAllAssignees && teamHasOnlySelectedMembers;
            });

            if (existingTeam) {
                console.log('Found existing team:', existingTeam);
                teamId = existingTeam.id;
            } else {
                console.log('Creating new team for assignees:', assignees);
                const newTeam = await createTeam.mutateAsync({
                    name: `Team for ${values.title}`,
                    description: '',
                    projectId: values.projectId,
                    members: values.assignees
                });

                if (!newTeam?.id) {
                    throw new Error("Team creation failed");
                }
                teamId = newTeam.id;
                console.log('Created new team with ID:', teamId);
            }

            if (!teamId) {
                console.error('No team ID after team handling');
                toast.error("Failed to assign team");
                return;
            }

            const processedTags = await Promise.all(
                values.tags.map(async (tag) => {
                    if (!tagSuggestions.find(s => s.id === tag.id)) {
                        const newTag = await createTag.mutateAsync({
                            name: tag.name,
                            color: tag.color
                        });
                        return {
                            id: newTag.id,
                            name: newTag.name,
                            color: newTag.color ?? 'blue'
                        };
                    }
                    return tag;
                })
            );

            const taskData = {
                ...values,
                teamId,
                tags: processedTags
            };

            console.log('Final task data before submission:', taskData);
            if (defaultValues?.id) {
                const { id, ...updateData } = { ...taskData, id: defaultValues.id };
                console.log('Updating task with data:', { id, ...updateData });
                await updateTask.mutateAsync({ id, ...updateData });
            } else {
                console.log('Creating new task with data:', taskData);
                await addTask.mutateAsync(taskData);
            }

            toast.success(defaultValues?.id ? "Task updated successfully" : "Task created successfully");
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to submit the form");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto w-full"> 
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
                    <div className="flex flex-row gap-2">
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select the task status'>
                                                {field.value && (
                                                    <div className="flex items-center">
                                                        {getStatusContent(field.value).label}
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["PENDING","IN_PROGRESS","REVIEW","COMPLETED"].map((status) => (
                                            <SelectItem 
                                                key={status} 
                                                value={status}
                                                className={`flex items-center gap-1`}
                                            >
                                                <div className="flex items-center">
                                                    <Dot className={`${getStatusContent(status).classname}`}/>
                                                    {getStatusContent(status).label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </div>
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
                                        onValueChange={(values) => field.onChange(values)}
                                        defaultValue={field.value}
                                        placeholder="Select assignees"
                                        animation={0}
                                        maxCount={10}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <DateTimePicker
                                        {...field}
                                        name="startDate"
                                        label="Start Date"
                                        minDate={new Date()}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <DateTimePicker
                                        {...field}
                                        name="deadline"
                                        label="Deadline"
                                        minDate={startDate}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
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
                        <Button 
                            type="button"
                            onClick={() => form.reset(defaultValues)}
                            disabled={isSubmitting}
                        >
                            Clear
                        </Button>
                        <Button 
                            type="submit"
                            onClick={() => {
                                const isValid = form.formState.isValid;
                                const errors = form.formState.errors;
                                console.log('Form is valid:', isValid);
                                console.log('Form errors:', errors);
                                console.log('Form values:', form.getValues());
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}