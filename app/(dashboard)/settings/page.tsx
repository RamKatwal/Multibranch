import { redirect } from "next/navigation"

import { getDefaultSettingsHref } from "@/config/settings-navigation"

export default function SettingsIndexPage() {
  redirect(getDefaultSettingsHref())
}
