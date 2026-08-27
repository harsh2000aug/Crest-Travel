import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./blogDetail.css";

const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  "http://192.168.1.11:3000";

const getFullImageUrl = (path) => {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  const cleanBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${cleanBase}/${cleanPath}`;
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/blog/${id}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch blog details. Status: ${response.status}`
        );
      }

      const result = await response.json();

      const data = result?.data || result;

      setPost(data);
    } catch (err) {
      console.error("Blog detail error:", err);
      setError(err.message || "Unable to load blog details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="blogDetail blogDetail--loading">
        <div className="blogDetail__loader">
          <div className="blogDetail__spinner"></div>

          <h3>Loading blog details...</h3>

          <p>Please wait while we fetch the article.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogDetail">
        <div className="blogDetail__error">
          <h2>Unable to Load Blog</h2>

          <p>{error}</p>

          <button
            className="blogDetail__backBtn"
            onClick={() => navigate("/admin-dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blogDetail">
        <div className="blogDetail__error">
          <h2>Blog Not Found</h2>

          <p>The requested article could not be found.</p>

          <button
            className="blogDetail__backBtn"
            onClick={() => navigate("/admin-dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const title = post.title || post.name || "Untitled Article";

  const authorImage =
    post.authorImage || post.authorAvatar || post.avatar || "";

  return (
    <div className="blogDetail">
      {/* =========================================
          HEADER
      ========================================== */}

      <div className="blogDetail__header">
        <div className="blogDetail__headerLeft">
          <div>
            <span className="blogDetail__headerLabel">BLOG ARTICLE</span>

            <h1 className="blogDetail__headerTitle">Article Details</h1>
          </div>
          <button
            className="blogDetail__backBtn"
            onClick={() => navigate("/admin-dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* =========================================
          MAIN CONTENT
      ========================================== */}

      <div className="blogDetail__container">
        <article className="blogDetail__article">
          {/* =========================================
              ARTICLE HEADER
          ========================================== */}

          <div className="blogDetail__articleHeader">
            <div className="blogDetail__metaTop">
              {post.category && (
                <span className="blogDetail__category">{post.category}</span>
              )}

              {post.status && (
                <span
                  className={`blogDetail__status ${
                    post.status === "published"
                      ? "blogDetail__status--published"
                      : "blogDetail__status--draft"
                  }`}
                >
                  {post.status}
                </span>
              )}
            </div>

            <h2 className="blogDetail__title">{title}</h2>

            {post.shortDescription && (
              <p className="blogDetail__shortDescription">
                {post.shortDescription}
              </p>
            )}

            <div className="blogDetail__articleMeta">
              <div className="blogDetail__metaItem">
                <span className="blogDetail__metaLabel">Published</span>

                <span className="blogDetail__metaValue">
                  {formatDate(
                    post.createdAt || post.publishedAt || post.startDate
                  )}
                </span>
              </div>

              <div className="blogDetail__metaItem">
                <span className="blogDetail__metaLabel">Slug</span>

                <span className="blogDetail__metaValue">
                  /{post.slug || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================
              ARTICLE CONTENT
          ========================================== */}

          <section className="blogDetail__contentSection">
            <div className="blogDetail__sectionHeading">
              <span>ARTICLE CONTENT</span>
            </div>

            {post.content ? (
              <div
                className="blogDetail__content"
                dangerouslySetInnerHTML={{
                  __html: post.content,
                }}
              />
            ) : (
              <p className="blogDetail__empty">No article content available.</p>
            )}
          </section>

          {/* =========================================
              AUTHOR INFORMATION
          ========================================== */}

          <section className="blogDetail__authorSection">
            <div className="blogDetail__sectionHeading">
              <span>AUTHOR INFORMATION</span>
            </div>

            <div className="blogDetail__authorCard">
              <div className="blogDetail__authorAvatar">
                {authorImage ? (
                  <img
                    src={getFullImageUrl(authorImage)}
                    alt={post.authorName || "Author"}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>
                    {(post.authorName || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="blogDetail__authorInfo">
                <h3>{post.authorName || "Unknown Author"}</h3>

                {post.authorEmail && (
                  <p className="blogDetail__authorEmail">{post.authorEmail}</p>
                )}

                {post.authorBio && (
                  <p className="blogDetail__authorBio">{post.authorBio}</p>
                )}

                {/* {post.instagramLink && (
                  <a
                    href={post.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blogDetail__instagram"
                  >
                    Instagram Profile →
                  </a>
                )} */}
              </div>
            </div>
          </section>

          {/* =========================================
              SEO INFORMATION
          ========================================== */}

          <section className="blogDetail__infoSection">
            <div className="blogDetail__sectionHeading">
              <span>SEO & METADATA</span>
            </div>

            <div className="blogDetail__infoGrid">
              <div className="blogDetail__infoCard">
                <span className="blogDetail__infoLabel">Meta Title</span>

                <div className="blogDetail__infoValue">
                  {post.metaTitle || "N/A"}
                </div>
              </div>

              <div className="blogDetail__infoCard">
                <span className="blogDetail__infoLabel">Meta Description</span>

                <div className="blogDetail__infoValue">
                  {post.metaDescription || "N/A"}
                </div>
              </div>

              <div className="blogDetail__infoCard">
                <span className="blogDetail__infoLabel">Image Alt Text</span>

                <div className="blogDetail__infoValue">
                  {post.imageAlt || "N/A"}
                </div>
              </div>

              <div className="blogDetail__infoCard">
                <span className="blogDetail__infoLabel">Category</span>

                <div className="blogDetail__infoValue">
                  {post.category || "Uncategorized"}
                </div>
              </div>
            </div>
          </section>

          {/* =========================================
              SCHEMA CODE
          ========================================== */}

          <section className="blogDetail__schemaSection">
            <div className="blogDetail__sectionHeading">
              <span>SCHEMA CODE (JSON-LD)</span>
            </div>

            <div className="blogDetail__codeBox">
              <pre>{post.schemaCode || "No schema code available."}</pre>
            </div>
          </section>

          {/* =========================================
              SYSTEM INFORMATION
          ========================================== */}

          <section className="blogDetail__systemSection">
            <div className="blogDetail__sectionHeading">
              <span>SYSTEM INFORMATION</span>
            </div>

            <div className="blogDetail__systemGrid">
              <div>
                <span>ID</span>

                <strong>{post._id || post.id || "N/A"}</strong>
              </div>

              <div>
                <span>STATUS</span>

                <strong>{post.status || "N/A"}</strong>
              </div>

              <div>
                <span>CREATED</span>

                <strong>{formatDateTime(post.createdAt)}</strong>
              </div>

              <div>
                <span>UPDATED</span>

                <strong>{formatDateTime(post.updatedAt)}</strong>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
