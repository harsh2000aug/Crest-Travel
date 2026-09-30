import React, { useEffect, useState } from "react";
import "./Blogpage.css";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import { hostname } from "../../../Utils/api/apiUtils";
import { Link } from "react-router-dom";

const BlogdetailPage = () => {
  const API_BASE_URL = hostname();

  const [posts, setPosts] = useState([]);



  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blog`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Failed to load data (Status: ${response.status})`);
        }

        const data = await response.json();

        const postsList = Array.isArray(data) ? data : data?.data || [];

        setPosts(postsList);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Fetch Error:", err);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, [API_BASE_URL]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };


  const truncateWords = (text, wordLimit = 10) => {
    if (!text) return "";

    const words = text.trim().split(/\s+/);

    if (words.length <= wordLimit) {
      return text;
    }

    return words.slice(0, wordLimit).join(" ") + " [...]";
  };
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <main className="blogDetailPage">
      {/* Page Header */}
      <section className="blogDetailPage__header">
        <Header />

        <div className="blogDetailPage__headerContainer">
          <span className="blogDetailPage__headerTag">Travel Blog</span>

          <h1 className="blogDetailPage__headerTitle">Blog Details</h1>

          <p className="blogDetailPage__headerText">
            Discover travel stories, tips, destinations and inspiration.
          </p>
        </div>
      </section>

      {/* Blog Cards */}
      <section className="blogDetailPage__section">
        <section className="blogDetailPage__related">
          <div className="blogDetailPage__cards">
            {posts.map((item, index) => (
              <Link
                className="blogDetailPage__relatedCard"
                key={item?._id}
                to={item?.slug ? `/blogs/${item.slug}` : "/blogs"}
              >
                <div className="blogDetailPage__relatedImage">
                  <img
                    src={item?.image}
                    alt={item?.imageAlt || item?.title}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>

                <div className="blogDetailPage__relatedInfo">
                  <small>{formatDate(item?.createdAt)}</small>

                  <h3>{item?.title}</h3>

                  <p>{truncateWords(item?.shortDescription, 15)}</p>

                  <span className="blogDetailPage__readMore">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
};

export default BlogdetailPage;
