import PostCard from "./PostCard";

export default function Feed({ posts, currentUserId, onLike, onDelete, onComment, onRepost }) {
  if (posts.length === 0) {
    return (
      <div className="panel panel-pad">
        <p className="subtle">No posts yet. Be the first to share an update.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          onLike={onLike}
          onDelete={onDelete}
          onComment={onComment}
          onRepost={onRepost}
        />
      ))}
    </div>
  );
}
