import {
    Check,
    Globe,
    Home,
    Keyboard,
    Link,
    Lock,
    MessageCircle,
    Paintbrush,
    Settings,
    Video,
} from "lucide-react"

export const data = {
    nav: [
        { name: "Home", icon: Home, href: '/' },
        { name: "Project", icon: Paintbrush, href:'/projects' },
        { name: "Messages & media", icon: MessageCircle },
        { name: "Language & region", icon: Globe },
        { name: "Accessibility", icon: Keyboard },
        { name: "Mark as read", icon: Check },
        { name: "Audio & video", icon: Video },
        { name: "Connected accounts", icon: Link },
        { name: "Privacy & visibility", icon: Lock },
        { name: "Advanced", icon: Settings },
    ]
}

const dashboardItems = [
    {
        name: "Home",
        icon: Home,
        href: "/",
    },
    {
        
    }
]