import { useEffect, useState } from "react";
import API from "../api/axios";
import CreatePost from "../components/feed/CreatePost";
import Feed from "../components/feed/Feed";
import StudentLayout from "../components/StudentLayout";
import RecruiterLayout from "../components/RecruiterLayout";

export default function NewsFeed() {
  const [posts, setPosts] = useState([]);
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
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create post");
      return false;
    }
  };

  const handleLikePost = async (postId) => {
    setPosts((prev) => prev.map((post) => (
      post._id === postId ? { ...post, likes: Number(post.likes || 0) + 1 } : post
    )));

    try {
      const res = await API.put(`/posts/${postId}/like`);
      const updated = res.data?.data;
      if (updated?._id) {
        setPosts((prev) => prev.map((post) => (post._id === updated._id ? updated : post)));
      }
    } catch {
      setPosts((prev) => prev.map((post) => (
        post._id === postId ? { ...post, likes: Math.max(0, Number(post.likes || 0) - 1) } : post
      )));
      alert("Failed to like post");
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
      <CreatePost onCreate={handleCreatePost} />
      <Feed
        posts={posts}
        currentUserId={currentUserId}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
      />
    </div>
  );

  if (role === "student") {
    return (
      <StudentLayout title="Jobify Feed" subtitle="News and updates from your hiring network.">
        {content}
      </StudentLayout>
    );
  }

  if (role === "recruiter") {
    return (
      <RecruiterLayout title="Jobify Feed" subtitle="News and updates from your hiring network.">
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
