import React from "react";

// A crash anywhere in the tree (a bad API response, a null field the UI
// didn't guard against) used to blank the whole page to white with no way
// back. This catches that and offers a reload instead.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex flex-col items-center justify-center gap-4 text-center px-6"
        style={{ width: "100%", height: "100vh", backgroundColor: "#F8F9FA", fontFamily: "'Roboto', sans-serif" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FFEBEE" }}
        >
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
            <path d="M11 2 1 19h20L11 2Z" stroke="#EA4335" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M11 8.5v4.5M11 15.5h.01" stroke="#EA4335" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", color: "#1C1B1F" }} className="text-[20px] font-bold">
          Something went wrong
        </h1>
        <p className="text-[14px]" style={{ color: "#5F6368", maxWidth: "380px" }}>
          This page ran into an unexpected error. Your unsubmitted code for the current problem is safe — reloading should fix this.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-white"
          style={{ backgroundColor: "#3A7CF5", fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer" }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
