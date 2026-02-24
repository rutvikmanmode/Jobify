import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/feed/Navbar";
import CreatePost from "../components/feed/CreatePost";
import Feed from "../components/feed/Feed";

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
      const res = await API.post("/posts", payload);
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

  return (
    <div className="app-shell">
      <div className="page-wrap max-w-4xl">
        <Navbar role={role} />
        <div className="grid gap-4">
          <CreatePost onCreate={handleCreatePost} />
          <Feed
            posts={posts}
            currentUserId={currentUserId}
            onLike={handleLikePost}
            onDelete={handleDeletePost}
          />
        </div>
      </div>
    </div>
  );
}
