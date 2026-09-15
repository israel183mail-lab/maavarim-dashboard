"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDone(false);
    await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, imageUrl: imageUrl || undefined, fileUrl: fileUrl || undefined }),
    });
    setLoading(false);
    setDone(true);
    setTitle("");
    setBody("");
    setImageUrl("");
    setFileUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <input required className="input" placeholder="כותרת ההודעה" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="input" placeholder="תוכן ההודעה" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="input" dir="ltr" placeholder="קישור לתמונה (אופציונלי)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <input className="input" dir="ltr" placeholder="קישור לקובץ PDF (אופציונלי)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "מפרסם..." : "פרסום הודעה בדף הבית"}
      </button>
      {done && <div className="text-sm text-emerald-600">ההודעה פורסמה</div>}
    </form>
  );
}
