import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Blogpage.css";
import { hostname } from "../../../Utils/api/apiUtils";
import Footer from "../../../reuseable-components/Footer";
import Header from "../../../reuseable-components/Header";

const BlogPage = () => {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = hostname();

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/blog`);

      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }

      const result = await response.json();

      if (result.success) {
        const blogs = Array.isArray(result.data) ? result.data : [];

        // Find the blog matching the URL slug
        const selectedBlog = blogs.find((item) => item.slug === slug);

        if (selectedBlog) {
          setBlog(selectedBlog);
        } else {
          setBlog(null);
          setError("Blog not found");
        }
      } else {
        setError("Blog not found");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Unable to load blog.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="tripoFullBlogPage">
        <div className="tripoFullBlogLoading">
          <div className="tripoFullBlogSpinner"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header />

        <div className="tripoFullBlogPage">
          <div className="tripoFullBlogError">
            <h2>Blog Not Found</h2>

            <p>{error || "The blog you are looking for does not exist."}</p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="blog-header">
        <Header />
      </div>

      <main className="tripoFullBlogPage">
        <div className="container">
          {/* Blog Image */}
          {blog.image && (
            <div className="tripoFullBlogHero">
              <img
                src={blog.image}
                alt={blog.imageAlt || blog.title}
                className="tripoFullBlogHeroImage"
              />
            </div>
          )}

          {/* Date */}
          <div className="tripoFullBlogDate">
            <span>Published</span>

            <strong>{formatDate(blog.updatedAt || blog.createdAt)}</strong>
          </div>

          {/* Title */}
          <h1 className="tripoFullBlogTitle">{blog.title}</h1>

          {/* Description */}
          {blog.shortDescription && (
            <p className="tripoFullBlogDescription">{blog.shortDescription}</p>
          )}

          {/* Blog Content */}
          <article className="tripoFullBlogContent">
            <div
              dangerouslySetInnerHTML={{
                __html: blog.content || "",
              }}
            />
          </article>

          {/* Author */}
          <section className="tripoFullBlogAuthorBox">
            {blog.authorImage && (
              <img
                src={blog.authorImage}
                alt={blog.authorName || "Author"}
                className="tripoFullBlogAuthorBoxImage"
              />
            )}

            <div className="tripoFullBlogAuthorBoxContent">
              <span className="tripoFullBlogWrittenBy">Written by</span>

              <h3 className="tripoFullBlogAuthorBoxName">
                {blog.authorName || "Admin"}
              </h3>

              {blog.authorBio && (
                <p className="tripoFullBlogAuthorBoxBio">{blog.authorBio}</p>
              )}

              {blog.instagramLink && (
                <a
                  href={blog.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tripoFullBlogInstagram"
                >
                  Instagram
                </a>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogPage;
