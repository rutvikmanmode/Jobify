import { useEffect, useState } from "react";
import API from "../api/axios";
import CreatePost from "../components/feed/CreatePost";
import Feed from "../components/feed/Feed";
import StudentLayout from "../components/StudentLayout";
import RecruiterLayout from "../components/RecruiterLayout";

export default function NewsFeed() {
  const [posts, setPosts] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const role = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data?.data || []);
    } catch {
      setPosts([]);
    }
  };

  const handleCreatePost = async (payload) => {
    try {
      let res;
      if (payload?.imageFile) {
        const formData = new FormData();
        formData.append("text", payload.text);
        formData.append("image", payload.imageFile);
        res = await API.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        res = await API.post("/posts", { text: payload.text });
      }
      setPosts((prev) => [res.data.data, ...prev]);
      setShowComposer(false);
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create post");
      return false;
    }
  };

  const replacePostInState = (updatedPost) => {
    if (!updatedPost?._id) return;
    setPosts((prev) => prev.map((item) => (item._id === updatedPost._id ? updatedPost : item)));
  };

  const handleLikePost = async (postId) => {
    let previousPost = null;
    setPosts((prev) => prev.map((post) => {
      if (post._id !== postId) return post;
      previousPost = post;
      const liked = Boolean(post.userHasLiked);
      return {
        ...post,
        userHasLiked: !liked,
        likes: liked ? Math.max(0, Number(post.likes || 0) - 1) : Number(post.likes || 0) + 1
      };
    }));

    try {
      const res = await API.put(`/posts/${postId}/like`);
      replacePostInState(res.data?.data);
    } catch {
      if (previousPost) replacePostInState(previousPost);
      alert("Failed to like post");
    }
  };

  const handleCommentPost = async (postId, text) => {
    try {
      const res = await API.post(`/posts/${postId}/comments`, { text });
      replacePostInState(res.data?.data);
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add comment");
      return false;
    }
  };

  const handleRepost = async (postId, text) => {
    try {
      const res = await API.post(`/posts/${postId}/repost`, { text });
      const repost = res.data?.data;
      const originalPost = res.data?.originalPost;
      if (repost) {
        setPosts((prev) => [repost, ...prev]);
      }
      if (originalPost) {
        replacePostInState(originalPost);
      }
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to repost");
      return false;
    }
  };

  const handleDeletePost = async (postId) => {
    const previousPosts = posts;
    setPosts((prev) => prev.filter((post) => post._id !== postId));

    try {
      await API.delete(`/posts/${postId}`);
    } catch (error) {
      setPosts(previousPosts);
      alert(error?.response?.data?.message || "Failed to delete post");
    }
  };

  const content = (
    <div className="grid gap-4">
      {showComposer ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="panel w-full max-w-2xl panel-pad">
            <CreatePost onCreate={handleCreatePost} onCancel={() => setShowComposer(false)} />
          </div>
        </div>
      ) : null}

      <Feed
        posts={posts}
        currentUserId={currentUserId}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        onComment={handleCommentPost}
        onRepost={handleRepost}
      />
    </div>
  );

  const headerAction = (
    <button type="button" className="btn-primary" onClick={() => setShowComposer(true)}>
      + Create Post
    </button>
  );

  if (role === "student") {
    return (
      <StudentLayout
        title="Jobify Feed"
        subtitle="News and updates from your hiring network."
        headerAction={headerAction}
      >
        {content}
      </StudentLayout>
    );
  }

  if (role === "recruiter") {
    return (
      <RecruiterLayout
        title="Jobify Feed"
        subtitle="News and updates from your hiring network."
        headerAction={headerAction}
      >
        {content}
      </RecruiterLayout>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-wrap max-w-4xl">
        {content}
      </div>
    </div>
  );
}
