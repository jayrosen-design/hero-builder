
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx is executing");

// Add error boundary for better debugging
try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    console.log("Creating root");
    root.render(<App />);
    console.log("App rendered");
  } else {
    console.error("Root element not found");
  }
} catch (error) {
  console.error("Error rendering app:", error);
  // Show a fallback UI instead of white screen
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Something went wrong</h1>
      <p>Please check the console for details.</p>
    </div>
  `;
}
