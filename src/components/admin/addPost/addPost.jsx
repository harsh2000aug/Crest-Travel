import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CKEditor } from "ckeditor4-react";
import "./addPost.css";
import { hostname } from "../../../Utils/api/apiUtils";

const API_BASE_URL = hostname();

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
  const [faqs, setFaqs] = useState([]);

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

      if (!response.ok) {
        throw new Error("Something went wrong.");
      }

      const result = await response.json();
      setFaqs(
        Array.isArray(data.faqs)
          ? data.faqs.map((faq) => ({
              question: faq.question || "",
              answer: faq.answer || "",
              status: faq.status || "active",
              sortOrder: faq.sortOrder || 0,
            }))
          : [],
      );

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

      // =========================
      // Existing Cover Image
      // =========================

      const existingCoverPath =
        data.image || data.coverImage || data.imageUrl || "";

      if (existingCoverPath) {
        setImagePreview(getFullImageUrl(existingCoverPath));
      }

      // =========================
      // Existing Author Image
      // =========================

      const existingAuthorPath =
        data.authorImage || data.authorAvatar || data.avatar || "";

      if (existingAuthorPath) {
        setAuthorImagePreview(getFullImageUrl(existingAuthorPath));
      }
    } catch (err) {
      console.error(err);

      alert(`Error fetching article details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();

    setFormData((prev) => ({
      ...prev,
      content: data,
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file);

      const previewUrl = URL.createObjectURL(file);

      setImagePreview(previewUrl);
    }
  };

  const handleAuthorImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setAuthorImageFile(file);

      const previewUrl = URL.createObjectURL(file);

      setAuthorImagePreview(previewUrl);
    }
  };

  const buildPayload = () => {
    const payload = new FormData();

    // Add all form fields
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key]);
    });

    // Add cover image
    if (imageFile) {
      payload.append("image", imageFile);
    }

    // Add author image
    if (authorImageFile) {
      payload.append("authorImage", authorImageFile);
    }

    return payload;
  };

  const createPost = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      method: "POST",
      body: payload,
    });

    if (!response.ok) {
      throw new Error("Failed to create post.");
    }

    return response.json();
  };

  const updatePost = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/blog/${editId}`, {
      method: "PUT",
      body: payload,
    });

    if (!response.ok) {
      throw new Error("Failed to update post.");
    }

    return response.json();
  };

  const createFaq = async (faqList) => {
    const faqPayload = {
      blogId: editId,
      faqs: faqList.map((faq, index) => ({
        question: faq.question,
        answer: faq.answer,
        status: faq.status || "active",
        sortOrder: index + 1,
      })),
    };

    const response = await fetch(`${API_BASE_URL}/blog/faq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(faqPayload),
    });

    if (!response.ok) {
      throw new Error("Failed to create FAQs.");
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cover image validation
    if (!imageFile && !imagePreview) {
      alert("Please upload a cover image.");
      return;
    }

    // Author image validation
    if (!authorImageFile && !authorImagePreview) {
      alert("Please upload an author image.");
      return;
    }

    // CKEditor validation
    if (!formData.content || formData.content.trim() === "") {
      alert("Please enter article content.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      console.log("Form Data:", formData);
      console.log("Cover Image:", imageFile);
      console.log("Author Image:", authorImageFile);

      if (editId) {
        await updatePost(payload);

        const validFaqs = faqs.filter(
          (faq) => faq.question.trim() !== "" && faq.answer.trim() !== "",
        );

        if (validFaqs.length > 0) {
          await createFaq(validFaqs);
        }

        alert("Post and FAQs updated successfully!");
      } else {
        await createPost(payload);

        alert("Post created successfully!");
      }
    } catch (err) {
      console.error(err);

      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFaqData = () => {
    setFaqs((prev) => [
      ...prev,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const handleFaqChange = (index, field, value) => {
    setFaqs((prev) =>
      prev.map((faq, faqIndex) =>
        faqIndex === index
          ? {
              ...faq,
              [field]: value,
            }
          : faq,
      ),
    );
  };

  const handleRemoveFaq = (index) => {
    setFaqs((prev) => prev.filter((_, faqIndex) => faqIndex !== index));
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
      {/* Header */}

      <div className="addPost__header">
        <h1>{editId ? "Edit Article" : "Create New Article"}</h1>

        <button
          type="button"
          className="addPost__viewBtn"
          onClick={() => navigate("/admin-dashboard")}
        >
          Cancel
        </button>
      </div>

      {/* Form */}

      <form onSubmit={handleSubmit} className="addPost__card">
        {/* =========================
            Title & Slug
        ========================= */}

        <div className="addPost__gridTwo">
          <div className="addPost__field">
            <label htmlFor="title">Title *</label>

            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
              placeholder="post-url-slug"
            />
          </div>
        </div>

        {/* =========================
            Category & Status
        ========================= */}

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

        {/* =========================
            Cover Image
        ========================= */}

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
                  required={!imagePreview}
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

            {/* Cover Preview */}

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

        {/* =========================
            Short Description
        ========================= */}

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

        {/* =========================
            CKEDITOR
        ========================= */}

        <div className="addPost__field">
          <label>Content</label>

          <div className="addPost__ckeditor">
            <CKEditor
              editorUrl="https://cdn.ckeditor.com/4.20.0/full/ckeditor.js"
              initData={formData.content}
              config={{
                height: 400,
                toolbar: "Full",
                allowedContent: true,
                toolbarCanCollapse: false,
                toolbarLocation: "top",
              }}
              onChange={(event) => {
                const data = event.editor.getData();

                setFormData((prev) => ({
                  ...prev,
                  content: data,
                }));
              }}
            />
          </div>
        </div>

        {/* =========================
            SEO
        ========================= */}

        <h2 className="addPost__sectionTitle">SEO & Metadata</h2>

        <div className="addPost__sectionBox">
          {/* Meta Title */}

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

          {/* Meta Description */}

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

          {/* Schema */}

          <div className="addPost__field">
            <label htmlFor="schemaCode">Schema Code (JSON-LD)</label>

            <textarea
                id="schemaCode"
                name="schemaCode"
                value={formData.schemaCode}
                onChange={handleChange}
                rows={3}
                className="addPost__codeTextarea"
                placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  ...\n}`}
              />
          </div>
        </div>

        {/* =========================
            Author Information
        ========================= */}

        <h2 className="addPost__sectionTitle">Author Information</h2>

        <div className="addPost__sectionBox">
          {/* Author Name & Email */}

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

          {/* Author Bio */}

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

          {/* Instagram & Avatar */}

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
                required={!authorImagePreview}
              />
            </div>

            {/* Avatar Preview */}

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

        {editId && faqs.length > 0 && (
          <>
            <h2 className="addPost__sectionTitle">
              Frequently Asked Questions
            </h2>

            {faqs.map((faq, index) => (
              <div
                key={index}
                className="addPost__sectionBox addPost__faqSection"
              >
                <div className="addPost__faqHeader">
                  <h3>FAQ {index + 1}</h3>

                  <button
                    type="button"
                    className="addPost__removeFaqBtn"
                    onClick={() => handleRemoveFaq(index)}
                  >
                    Remove FAQ
                  </button>
                </div>

                <div className="addPost__field">
                  <label htmlFor={`faq-question-${index}`}>Question</label>

                  <input
                    id={`faq-question-${index}`}
                    type="text"
                    value={faq.question}
                    onChange={(e) =>
                      handleFaqChange(index, "question", e.target.value)
                    }
                    placeholder="Enter FAQ question"
                  />
                </div>

                <div className="addPost__field">
                  <label htmlFor={`faq-answer-${index}`}>Answer</label>

                  <textarea
                    id={`faq-answer-${index}`}
                    value={faq.answer}
                    onChange={(e) =>
                      handleFaqChange(index, "answer", e.target.value)
                    }
                    rows={5}
                    placeholder="Enter FAQ answer"
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* =========================
            Submit
        ========================= */}

        <div className="addPost__submitActions">
          {editId && (
            <button
              type="button"
              className="addPost__faqBtn"
              onClick={handleFaqData}
            >
              Add FAQ
            </button>
          )}

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
        </div>
      </form>
    </div>
  );
};

export default AddPost;
