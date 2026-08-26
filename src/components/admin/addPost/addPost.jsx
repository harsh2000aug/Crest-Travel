import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./addPost.css";

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

const AddPost = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    schemaCode: "",
    shortDescription: "",
    metaTitle: "",
    metaDescription: "",
    category: "",
    imageAlt: "",
    content: "",
    authorName: "",
    authorBio: "",
    authorEmail: "",
    instagramLink: "",
    status: "published",
  });

  // Files & Previews State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [authorImageFile, setAuthorImageFile] = useState(null);
  const [authorImagePreview, setAuthorImagePreview] = useState("");

  useEffect(() => {
    if (editId) {
      fetchPostDetails(editId);
    }
  }, [editId]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      if (authorImagePreview && authorImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(authorImagePreview);
      }
    };
  }, [imagePreview, authorImagePreview]);

  const fetchPostDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/blog/${id}`);
      if (!response.ok) throw new Error("Failed to fetch post details.");

      const result = await response.json();
      const data = result.data || result;

      setFormData({
        title: data.title || data.name || "",
        slug: data.slug || "",
        schemaCode: data.schemaCode || "",
        shortDescription: data.shortDescription || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        category: data.category || "",
        imageAlt: data.imageAlt || "",
        content: data.content || "",
        authorName: data.authorName || "",
        authorBio: data.authorBio || "",
        authorEmail: data.authorEmail || "",
        instagramLink: data.instagramLink || "",
        status: data.status || "published",
      });

      const existingCoverPath =
        data.image || data.coverImage || data.imageUrl || "";
      if (existingCoverPath) {
        setImagePreview(getFullImageUrl(existingCoverPath));
      }

      const existingAuthorPath =
        data.authorImage || data.authorAvatar || data.avatar || "";
      if (existingAuthorPath) {
        setAuthorImagePreview(getFullImageUrl(existingAuthorPath));
      }
    } catch (err) {
      alert(`Error fetching article details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAuthorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAuthorImageFile(file);
      setAuthorImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (authorImageFile) {
        payload.append("authorImage", authorImageFile);
      }

      const url = editId
        ? `${API_BASE_URL}/blog/${editId}`
        : `${API_BASE_URL}/blog`;

      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editId ? "update" : "create"} post.`);
      }

      alert(`Post ${editId ? "updated" : "created"} successfully!`);
      navigate("/admin-dash");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="addPost addPost--loading">
        <h3>Loading post details...</h3>
      </div>
    );
  }

  return (
    <div className="addPost">
      <div className="addPost__header">
        <h1>{editId ? "Edit Article" : "Create New Article"}</h1>
        <button
          type="button"
          className="addPost__viewBtn"
          onClick={() => navigate("/admin-dash")}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="addPost__card">
        {/* Title & Slug Group */}
        <div className="addPost__gridTwo">
          <div className="addPost__field">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter post title"
            />
          </div>

          <div className="addPost__field">
            <label htmlFor="slug">Slug *</label>
            <input
              id="slug"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="post-url-slug"
            />
          </div>
        </div>

        {/* Category & Status Group */}
        <div className="addPost__gridTwo">
          <div className="addPost__field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Technology"
            />
          </div>

          <div className="addPost__field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="addPost__sectionBox">
          <h3 className="addPost__subHeading">Cover Image</h3>
          <div className="addPost__imageSection">
            <div className="addPost__imageFields">
              <div className="addPost__field">
                <label htmlFor="imageFile">Upload Cover Image</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="addPost__fileInput"
                />
              </div>

              <div className="addPost__field">
                <label htmlFor="imageAlt">Image Alt Text</label>
                <input
                  id="imageAlt"
                  type="text"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleChange}
                  placeholder="Alt description for image"
                />
              </div>
            </div>

            {/* Cover Image Preview */}
            <div className="addPost__previewContainer">
              <label>Preview</label>
              <div className="addPost__previewBox">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span>No Image Selected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="addPost__field">
          <label htmlFor="shortDescription">Short Description</label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            rows={2}
            placeholder="Brief snippet of the post"
          />
        </div>

        {/* Article Content */}
        <div className="addPost__field">
          <label htmlFor="content">Content (HTML)</label>
          <div className="addPost__editorMock">
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              placeholder="Write your article content here..."
            />
            <div className="addPost__editorBreadcrumb">p &gt; html</div>
          </div>
        </div>

        {/* SEO Configuration Section */}
        <h2 className="addPost__sectionTitle">SEO &amp; Metadata</h2>
        <div className="addPost__sectionBox">
          <div className="addPost__field">
            <label htmlFor="metaTitle">Meta Title</label>
            <input
              id="metaTitle"
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              placeholder="SEO Meta Title"
            />
          </div>

          <div className="addPost__field">
            <label htmlFor="metaDescription">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={2}
              placeholder="SEO Meta Description"
            />
          </div>

          <div className="addPost__field">
            <label htmlFor="schemaCode">Schema Code (JSON-LD)</label>
            <textarea
              id="schemaCode"
              name="schemaCode"
              value={formData.schemaCode}
              onChange={handleChange}
              rows={3}
              className="addPost__codeTextarea"
              placeholder='<script type="application/ld+json">...</script>'
            />
          </div>
        </div>

        {/* Author Information Section */}
        <h2 className="addPost__sectionTitle">Author Information</h2>
        <div className="addPost__sectionBox">
          <div className="addPost__gridTwo">
            <div className="addPost__field">
              <label htmlFor="authorName">Author Name</label>
              <input
                id="authorName"
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="addPost__field">
              <label htmlFor="authorEmail">Author Email</label>
              <input
                id="authorEmail"
                type="email"
                name="authorEmail"
                value={formData.authorEmail}
                onChange={handleChange}
                placeholder="author@example.com"
              />
            </div>
          </div>

          <div className="addPost__field">
            <label htmlFor="authorBio">Author Bio</label>
            <textarea
              id="authorBio"
              name="authorBio"
              value={formData.authorBio}
              onChange={handleChange}
              rows={2}
              placeholder="Short bio about the author"
            />
          </div>

          <div className="addPost__authorSection">
            <div className="addPost__field">
              <label htmlFor="instagramLink">Instagram Profile Link</label>
              <input
                id="instagramLink"
                type="url"
                name="instagramLink"
                value={formData.instagramLink}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="addPost__field">
              <label htmlFor="authorImageFile">Author Avatar</label>
              <input
                id="authorImageFile"
                type="file"
                accept="image/*"
                onChange={handleAuthorImageChange}
                className="addPost__fileInput"
              />
            </div>

            {/* Author Avatar Preview */}
            <div className="addPost__avatarContainer">
              <label>Avatar</label>
              <div className="addPost__avatarBox">
                {authorImagePreview ? (
                  <img
                    src={authorImagePreview}
                    alt="Author Preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span>No Avatar</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="addPost__submitBtn"
        >
          {submitting
            ? "Saving Post..."
            : editId
            ? "Update Article"
            : "Publish Article"}
        </button>
      </form>
    </div>
  );
};

export default AddPost;
