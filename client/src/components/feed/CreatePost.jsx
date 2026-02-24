import { useState } from "react";

export default function CreatePost({ onCreate, onCancel }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const created = await onCreate({
        text: text.trim(),
        imageFile
      });
      if (created) {
        setText("");
        setImageFile(null);
        formEl.reset();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel panel-pad">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Create Post</h2>
      <textarea
        className="input min-h-[110px]"
        placeholder="What do you want to talk about?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        className="input mt-3"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        {onCancel ? (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
