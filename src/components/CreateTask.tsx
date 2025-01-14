'use client'

import { useState } from 'react';
import { 
    Dialog, 
    DialogContent,
    DialogHeader, 
    DialogTitle, 
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Plus } from 'lucide-react';
import MyForm from '@/app/(root)/tasks/add-task';

export default function CreateTask() {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button variant={'none'} size={'none'}><Plus/></Button>
            </DialogTrigger>
            <DialogContent className="p-4">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create task</DialogTitle>
                    <MyForm/>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
