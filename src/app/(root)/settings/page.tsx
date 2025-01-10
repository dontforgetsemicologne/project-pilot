import ProfileSettingForm from "@/components/ProfileSettingForm";
import { auth } from "@/server/auth"

export default async function ProfileSettingPage() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("User session or ID is unavailable");
    }
    return(
        <ProfileSettingForm id={session?.user.id}/>
    )
}
