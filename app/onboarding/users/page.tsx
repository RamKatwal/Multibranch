import { redirect } from "next/navigation"

/** Users is no longer an onboarding step; resume into the app. */
export default function OnboardingUsersPage() {
  redirect("/")
}
