"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { DeliveryNoteForm } from "@/components/sales/delivery-note/delivery-note-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  createDeliveryNoteId,
  getDeliveryNoteById,
  readDeliveryNotes,
  saveDeliveryNotes,
} from "@/lib/delivery-notes/storage"
import type { DeliveryNote } from "@/types/delivery-note"

export function CreateDeliveryNotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get("id")
  const [ready, setReady] = React.useState(false)
  const [notes, setNotes] = React.useState<DeliveryNote[]>([])
  const [initialNote, setInitialNote] = React.useState<
    DeliveryNote | undefined
  >()

  React.useEffect(() => {
    const all = readDeliveryNotes()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(all)
    setInitialNote(noteId ? getDeliveryNoteById(noteId) : undefined)
    setReady(true)
  }, [noteId])

  const isEdit = Boolean(noteId)
  const backHref = "/sales/delivery-note"

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
      nativeButton={false}
      render={<Link href={backHref} />}
    >
      <ArrowLeftIcon />
      Back to delivery notes
    </Button>
  )

  function handleSubmit(note: DeliveryNote) {
    const next =
      isEdit && notes.some((item) => item.id === note.id)
        ? notes.map((item) => (item.id === note.id ? note : item))
        : [note, ...notes]
    saveDeliveryNotes(next)
    toast.success(
      isEdit
        ? `Delivery note "${note.id}" saved.`
        : `Delivery note "${note.id}" created.`
    )
    router.push(backHref)
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isEdit ? "Edit Delivery Note" : "New Delivery Note"}
          breadcrumb={backButton}
        />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isEdit && !initialNote) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Edit Delivery Note" breadcrumb={backButton} />
        <Card size="sm" className="ring-foreground/10">
          <CardContent className="pt-(--card-spacing) text-sm text-muted-foreground">
            This delivery note could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={isEdit ? "Edit Delivery Note" : "New Delivery Note"}
        breadcrumb={backButton}
      />

      <DeliveryNoteForm
        initialNote={initialNote}
        nextId={createDeliveryNoteId(notes)}
        submitLabel={isEdit ? "Save changes" : "Create Delivery Note"}
        onSubmitNote={handleSubmit}
        onCancel={() => router.push(backHref)}
      />
    </div>
  )
}
