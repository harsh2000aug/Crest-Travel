import React, { useState, useEffect } from "react";
import "./adminDash.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  "http://192.168.1.11:3000";

const AdminDash = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/blog`);

      if (!response.ok) {
        throw new Error(`Failed to load data (Status: ${response.status})`);
      }

      const data = await response.json();
      const postsList = Array.isArray(data) ? data : data.data || [];
      setPosts(postsList);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const title = post.title || post.name || "";
    const category = post.category || "";
    const slug = post.slug || "";
    const query = search.toLowerCase();

    return (
      title.toLowerCase().includes(query) ||
      category.toString().toLowerCase().includes(query) ||
      slug.toLowerCase().includes(query)
    );
  });

  // Pagination Calculations
  const totalEntries = filteredPosts.length;
  const totalPages = Math.ceil(totalEntries / entries) || 1;
  const startIndex = (currentPage - 1) * entries;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + entries);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete post.");

        setPosts((prev) => prev.filter((post) => (post._id || post.id) !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  return (
    <div className="dash-container">
      {/* Top Header */}
      <div className="dash-header-card">
        <div>
          <h1 className="dash-title">Posts Management</h1>
          <p className="dash-subtitle">
            Manage, search, and organize all published articles
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/admin-addPost")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Post
        </button>
      </div>

      {/* Main Card */}
      <div className="dash-content-card">
        {/* Toolbar */}
        <div className="dash-toolbar">
          <div className="dash-entries-selector">
            {/* <label>Show :</label> */}
            <select
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 entries</option>
              <option value={25}>25 entries</option>
              <option value={50}>50 entries</option>
            </select>
          </div>

          <div className="dash-search-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by title, category, or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="dash-state-container">
            <div className="spinner"></div>
            <p>Fetching articles...</p>
          </div>
        ) : error ? (
          <div className="dash-state-container error">
            <p>Something went wrong: {error}</p>
            <button className="btn-retry" onClick={fetchPosts}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>#ID</th>
                  <th>Image</th>
                  <th>Article Details</th>
                  <th>Category</th>
                  <th>Published Date</th>
                  <th style={{ textAlign: "right", width: "160px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.length > 0 ? (
                  paginatedPosts.map((post, idx) => {
                    const postId = post._id || post.id || startIndex + idx + 1;
                    const imageUrl = post.image?.startsWith("http")
                      ? post.image
                      : post.image
                      ? `${API_BASE_URL}/${post.image}`
                      : null;

                    return (
                      <tr key={postId}>
                        <td className="col-id">
                          #
                          {typeof postId === "string"
                            ? postId.slice(-4)
                            : postId}
                        </td>
                        <td>
                          <div className="thumbnail-box">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.imageAlt || "Thumbnail"}
                              />
                            ) : (
                              <div className="no-image-placeholder">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="col-details">
                          <span className="post-title">
                            {post.title || post.name}
                          </span>
                          <span className="post-slug">/{post.slug}</span>
                        </td>
                        <td>
                          <span className="badge-category">
                            {post.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="col-date">
                          {formatDate(post.createdAt || post.startDate)}
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button
                              className="btn-icon btn-edit"
                              title="Edit Post"
                              onClick={() =>
                                navigate(`/admin-addPost?edit=${postId}`)
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              title="Delete Post"
                              onClick={() => handleDelete(postId)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="dash-empty-state">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer & Pagination */}
        <div className="dash-footer">
          <span className="footer-info">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + entries, totalEntries)} of {totalEntries}{" "}
            entries
          </span>

          <div className="dash-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span className="pagination-page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
