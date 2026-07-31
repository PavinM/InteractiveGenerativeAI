import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-[#0B0B0B] text-white p-6">
          <div className="max-w-md w-full text-center space-y-4 bg-[#16181D] border border-white/10 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-400">Deku AI Assistant</h2>
            <p className="text-sm text-gray-300">An unexpected rendering state occurred. Click below to reload the workspace.</p>
            <button
              onClick={() => {
                localStorage.removeItem('tinyllama_chats');
                window.location.reload();
              }}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg transition-all"
            >
              Reset Workspace & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
