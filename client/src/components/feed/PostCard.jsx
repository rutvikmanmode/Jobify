export default function PostCard({ post, canDelete, onLike, onDelete }) {
  return (
    <article className="panel panel-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{post.author?.name || "User"}</p>
          <p className="text-xs text-slate-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-slate-800 mt-3 whitespace-pre-wrap">{post.text}</p>

      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt="Post"
          className="mt-3 w-full max-h-96 object-cover rounded-xl border border-slate-200 bg-white"
        />
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <button type="button" className="btn-secondary" onClick={() => onLike(post._id)}>
          Like ({post.likes || 0})
        </button>
        {canDelete && (
          <button type="button" className="btn-danger" onClick={() => onDelete(post._id)}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
