'use client' 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    department: z.string().optional(), 
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfileSettingForm({ id }: { id: string }) {
    
    const router = useRouter();
    const getUser = api.user.getById.useQuery(id);
    const updateProfile = api.user.updateProfile.useMutation();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: getUser.data?.name ?? "",
            role: getUser.data?.role ?? "",
            department: getUser.data?.department ?? "",
        }
    });

    const onSubmit = (data: FormValues) => {
        const normalizedData: FormValues = {
            name: ( data.name === '' ) ? getUser.data?.name ?? "" : data.name,
            role: ( data.role === '' ) ? getUser.data?.role ?? "" : data.role,
            department: ( data.department === '' ) ? getUser.data?.department ?? "" : data.department,

        }
        updateProfile.mutate(normalizedData, {
            onSuccess: () => {
                router.push("/users");
            }
        });
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 p-6 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="flex items-center justify-center gap-6">
                <Avatar className="h-24 w-24 rounded-full border-2 border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                    <AvatarImage
                        src={getUser?.data?.image ?? '/default-avatar.png'}
                        className="h-24 w-24 rounded-full border-2 border-dashed border-zinc-200/80 dark:border-zinc-800/80 
                            hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50
                            transition-colors shadow-sm"
                    />
                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900">
                        {getUser?.data?.name?.slice(0, 2)?.toUpperCase() ?? "US"}
                    </AvatarFallback>
                </Avatar>
            </div>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Display Name</Label>
                            <Input
                                id="name"
                                defaultValue={getUser?.data?.name ?? ""}
                                {...form.register("name")}
                                className="bg-white dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role" className="text-zinc-700 dark:text-zinc-300">Role</Label>
                            <Input
                                id="role"
                                defaultValue={getUser?.data?.role ?? ""}
                                {...form.register("role")}
                                className="bg-white dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="department" className="text-zinc-700 dark:text-zinc-300">Department</Label>
                            <Input
                                id="department"
                                defaultValue={getUser?.data?.department ?? ""}
                                {...form.register("department")}
                                className="bg-white dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" className="border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">Clear</Button>
                        <Button type="submit" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">Save Changes</Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
