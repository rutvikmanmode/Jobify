import { useState } from "react";
import { toServerAssetUrl } from "../../utils/apiBase";

const fallbackAvatar = "https://via.placeholder.com/48?text=U";

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onComment,
  onRepost
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showRepostBox, setShowRepostBox] = useState(false);
  const [repostText, setRepostText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [reposting, setReposting] = useState(false);

  const canDelete = post.author?._id === currentUserId;
  const comments = post.comments || [];

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommenting(true);
    const ok = await onComment(post._id, commentText.trim());
    if (ok) {
      setCommentText("");
      setShowComments(true);
    }
    setCommenting(false);
  };

  const submitRepost = async (e) => {
    e.preventDefault();
    setReposting(true);
    const ok = await onRepost(post._id, repostText.trim());
    if (ok) {
      setRepostText("");
      setShowRepostBox(false);
    }
    setReposting(false);
  };

  return (
    <article className="panel linkedin-post-card">
      <div className="panel-pad">
        {post.repostOf ? (
          <p className="text-xs text-slate-500 mb-2">
            {post.author?.name || "User"} reposted
          </p>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <img
              src={post.author?.profilePhoto ? toServerAssetUrl(post.author.profilePhoto) : fallbackAvatar}
              alt={post.author?.name || "User"}
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="font-semibold text-slate-900">{post.author?.name || "User"}</p>
              <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {canDelete ? (
            <button type="button" className="text-xs text-rose-600 font-semibold" onClick={() => onDelete(post._id)}>
              Delete
            </button>
          ) : null}
        </div>

        {post.text ? <p className="text-slate-800 mt-3 whitespace-pre-wrap">{post.text}</p> : null}
        {post.imageUrl ? (
          <img
            src={toServerAssetUrl(post.imageUrl)}
            alt="Post"
            className="mt-3 w-full max-h-[28rem] object-cover rounded-xl border border-slate-200 bg-white"
          />
        ) : null}

        {post.repostOf ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">
              {post.repostOf?.author?.name || "Original author"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {post.repostOf?.createdAt ? new Date(post.repostOf.createdAt).toLocaleString() : ""}
            </p>
            {post.repostOf?.text ? (
              <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{post.repostOf.text}</p>
            ) : null}
            {post.repostOf?.imageUrl ? (
              <img
                src={toServerAssetUrl(post.repostOf.imageUrl)}
                alt="Original post"
                className="mt-2 w-full max-h-80 object-cover rounded-lg border border-slate-200"
              />
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>{post.likes || 0} likes</span>
          <span>{post.commentsCount || comments.length} comments · {post.repostCount || 0} reposts</span>
        </div>
      </div>

      <div className="border-t border-slate-200 px-3 py-2 flex items-center gap-1">
        <button
          type="button"
          className={`feed-action-btn ${post.userHasLiked ? "is-active" : ""}`}
          onClick={() => onLike(post._id)}
        >
          Like
        </button>
        <button type="button" className="feed-action-btn" onClick={() => setShowComments((prev) => !prev)}>
          Comment
        </button>
        <button type="button" className="feed-action-btn" onClick={() => setShowRepostBox((prev) => !prev)}>
          Repost
        </button>
      </div>

      {showRepostBox ? (
        <form onSubmit={submitRepost} className="px-3 pb-3">
          <textarea
            className="input min-h-[84px]"
            placeholder="Add thoughts to your repost (optional)"
            value={repostText}
            onChange={(e) => setRepostText(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={reposting}>
              {reposting ? "Reposting..." : "Repost"}
            </button>
          </div>
        </form>
      ) : null}

      {showComments ? (
        <div className="px-3 pb-3">
          <form onSubmit={submitComment} className="mb-3 flex items-start gap-2">
            <input
              className="input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn-primary whitespace-nowrap" disabled={commenting}>
              {commenting ? "Posting..." : "Post"}
            </button>
          </form>

          <div className="grid gap-2">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                  <p className="text-sm font-semibold text-slate-900">{comment.author?.name || "User"}</p>
                  <p className="text-xs text-slate-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                  </p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}
