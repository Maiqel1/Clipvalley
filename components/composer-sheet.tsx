"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type ComposerSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmitText: (value: string, title: string) => void;
  onSubmitImage: (file: File, title: string) => void;
  onSubmitFile: (file: File, title: string) => void;
};

export function ComposerSheet({
  open,
  onClose,
  onSubmitText,
  onSubmitImage,
  onSubmitFile,
}: ComposerSheetProps) {
  const [value, setValue] = React.useState("");
  const [title, setTitle] = React.useState("");
  const imageInput = React.useRef<HTMLInputElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const close = React.useCallback(() => {
    setValue("");
    setTitle("");
    onClose();
  }, [onClose]);

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setValue((current) => (current ? `${current}\n${text}` : text));
      else toast("Your clipboard is empty.", "error");
    } catch {
      toast("Your browser blocked clipboard access.", "error");
    }
  }

  function submit() {
    if (!value.trim()) return;
    onSubmitText(value, title);
    close();
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        title="New clip"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={pasteFromClipboard}>
              <Icon name="content_copy" size={18} />
              Paste from clipboard
            </Button>
            <Button variant="secondary" size="sm" onClick={() => imageInput.current?.click()}>
              <Icon name="image" size={18} />
              Add image
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
              <Icon name="description" size={18} />
              Add file
            </Button>
            <Button size="sm" className="ml-auto" disabled={!value.trim()} onClick={submit}>
              Save clip
            </Button>
          </>
        }
      >
        <div className="mb-4">
          <Field
            label="Title"
            hint="Optional"
            icon="subject"
            name="title"
            value={title}
            maxLength={80}
            placeholder="Name this clip"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <Textarea
          data-autofocus
          rows={6}
          value={value}
          placeholder="Paste or type anything…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
      </Dialog>

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onSubmitImage(file, title);
            close();
          }
        }}
      />

      <input
        ref={fileInput}
        type="file"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onSubmitFile(file, title);
            close();
          }
        }}
      />
    </>
  );
}
