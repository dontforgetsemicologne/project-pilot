"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, Check, Plus, Palette } from "lucide-react";
import { useTags } from "@/hooks/use-tags";
import { useClickOutside } from "@/hooks/use-click-outside";

interface Tag {
    id: string;
    label: string;
    color?: string;
}

interface TagInputProps {
    onChange?: (tags: Tag[]) => void;
    defaultTags?: Tag[];
    suggestions?: Tag[];
    maxTags?: number;
    label?: string;
    placeholder?: string;
    error?: string;
}

const tagStyles = {
    base: "inline-flex items-center gap-1.5 px-2 py-0.5 text-sm rounded-md transition-colors duration-150",
    colors: {
        blue: "bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30 dark:hover:border-blue-600/50",
        purple: "bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/30 dark:hover:border-purple-600/50",
        green: "bg-green-50 text-green-700 border border-green-200 hover:border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/30 dark:hover:border-green-600/50",
        slate: 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700/30 dark:hover:border-slate-600/50',
        red: 'bg-red-50 text-red-700 border border-red-200 hover:border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/30 dark:hover:border-red-600/50',
        orange: 'bg-orange-50 text-orange-700 border border-orange-200 hover:border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/30 dark:hover:border-orange-600/50',
        yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/30 dark:hover:border-yellow-600/50',
        lime: 'bg-lime-50 text-lime-700 border border-lime-200 hover:border-lime-300 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700/30 dark:hover:border-lime-600/50',
        emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30 dark:hover:border-emerald-600/50'
    },
};

export default function TagCreator({
    onChange,
    defaultTags = [],
    suggestions = [],
    maxTags = 10,
    label = "Tags",
    placeholder = "Add tags...",
    error,
}: TagInputProps) {
    const { tags, addTag, removeTag, removeLastTag } = useTags({
        onChange,
        defaultTags,
        maxTags,
    });
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pendingTag, setPendingTag] = useState<{ label: string; color?: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = suggestions
        .filter(
            (suggestion) =>
                suggestion.label.toLowerCase().includes(input.toLowerCase()) &&
                !tags.find((tag) => tag.id === suggestion.id)
        )
        .slice(0, 5);

    const canAddNewTag =
        !suggestions.find(
            (s) => s.label.toLowerCase() === input.toLowerCase()
        ) && input.length > 0;

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Backspace" && input === "" && tags.length > 0) {
            removeLastTag();
        } else if (e.key === "Enter" && input) {
            e.preventDefault();
            if (isOpen && filteredSuggestions[selectedIndex]) {
                addTag(filteredSuggestions[selectedIndex]);
                setInput("");
                setIsOpen(false);
            } else if (canAddNewTag) {
                setPendingTag({ label: input });
                setShowColorPicker(true);
                setInput("");
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setShowColorPicker(false);
        }
    }

    const handleColorSelect = (color: string) => {
        if (pendingTag) {
            addTag({
                id: pendingTag.label,
                label: pendingTag.label,
                color: tagStyles.colors[color as keyof typeof tagStyles.colors],
            });
            setPendingTag(null);
            setShowColorPicker(false);
        }
    };

    useClickOutside(containerRef, () => {
        setIsOpen(false);
        setShowColorPicker(false);
    });

    return (
        <div className="w-full space-y-2" ref={containerRef}>
            {label && (
                <label
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    htmlFor={label}
                >
                    {label}
                </label>
            )}

            <div
                className={cn(
                    "min-h-[3rem] sm:min-h-[2.5rem] p-2 sm:p-1.5",
                    "rounded-lg border",
                    "bg-transparent",
                    "flex items-center flex-row flex-wrap gap-2 sm:gap-1.5 relative"
                )}
            >
                {tags.map((tag) => (
                    <span
                        key={tag.id}
                        className={cn(
                            tagStyles.base,
                            "text-base sm:text-sm py-1 sm:py-0.5",
                            tag.color ?? tagStyles.colors.blue
                        )}
                    >
                        {tag.label}
                        <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            className={cn(
                                "text-current/60 hover:text-current transition-colors",
                                "p-1 sm:p-0"
                            )}
                        >
                            <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(0);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className={cn(
                        "flex-1 min-w-[140px] sm:min-w-[120px] bg-transparent",
                        "h-8 sm:h-7",
                        "text-base sm:text-sm",
                        "text-zinc-900 dark:text-zinc-100",
                        "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
                        "focus:outline-none"
                    )}
                />

                {showColorPicker && pendingTag && (
                    <div className={cn(
                        "absolute left-0 right-0 top-full mt-1 z-50",
                        "bg-white dark:bg-zinc-900",
                        "border border-zinc-300 dark:border-zinc-700",
                        "rounded-lg shadow-lg",
                        "p-4"
                    )}>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                <span className="text-sm font-medium">Select color for &ldquo;{pendingTag.label}&rdquo;"</span>
                            </div>
                            <div className="flex gap-2">
                                {Object.entries(tagStyles.colors).map(([colorName, colorClass]) => (
                                    <button
                                        key={colorName}
                                        onClick={() => handleColorSelect(colorName)}
                                        className={cn(
                                            tagStyles.base,
                                            colorClass,
                                            "cursor-pointer"
                                        )}
                                    >
                                        {colorName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isOpen && (input || filteredSuggestions.length > 0) && !showColorPicker && (
                    <div
                        className={cn(
                            "absolute left-0 right-0 top-full mt-1 z-50",
                            "max-h-[60vh] sm:max-h-[300px] overflow-y-auto",
                            "bg-white dark:bg-zinc-900",
                            "border border-zinc-300 dark:border-zinc-700",
                            "rounded-lg shadow-lg dark:shadow-zinc-950/50",
                            "overflow-hidden"
                        )}
                    >
                        <div className="px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800">
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                Choose a tag or create one
                            </span>
                        </div>
                        <div className="p-2 sm:p-1.5 flex flex-wrap gap-2 sm:gap-1.5">
                            {filteredSuggestions.map((suggestion, index) => (
                                <button
                                    type="button"
                                    key={suggestion.id}
                                    onClick={() => {
                                        addTag(suggestion);
                                        setInput("");
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        tagStyles.base,
                                        selectedIndex === index
                                            ? tagStyles.colors.blue
                                            : "bg-zinc-50 text-zinc-700 border border-zinc-300 hover:border-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                                    )}
                                >
                                    {suggestion.label}
                                    {selectedIndex === index && (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            ))}
                            {canAddNewTag && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPendingTag({ label: input });
                                        setShowColorPicker(true);
                                        setInput("");
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        tagStyles.base,
                                        selectedIndex === filteredSuggestions.length
                                            ? tagStyles.colors.blue
                                            : "bg-zinc-50 text-zinc-700 border border-zinc-300 hover:border-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                                    )}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Create  &ldquo;{input}&rdquo;
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}