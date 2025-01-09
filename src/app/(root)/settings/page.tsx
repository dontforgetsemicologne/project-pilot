import ProfileSettingForm from "@/components/ProfileSettingForm";
import { auth } from "@/server/auth"

export default async function ProfileSettingPage() {
    const session = await auth();
    return(
        <ProfileSettingForm id={session?.user.id!}/>
    )
}
