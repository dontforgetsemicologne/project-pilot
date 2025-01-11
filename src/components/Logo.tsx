'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Logo() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const darkModeMatch = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(darkModeMatch.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
        darkModeMatch.addEventListener('change', handleChange);

        return () => darkModeMatch.removeEventListener('change', handleChange);
    }, []);
    return (
        <Link href="\">
            <Image 
                src={isDark ? '/dark-logo.png' : '/logo.png'} 
                alt='logo' 
                height={50} 
                width={50}
            />
        </Link>
    )
}
