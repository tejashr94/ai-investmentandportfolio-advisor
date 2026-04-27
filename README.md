# AI Horizon — Smart Investment Diversification Guide

AI Horizon is a strict, specialist Investment & Portfolio Advisor chatbot. It helps users understand asset allocation, portfolio diversification, and risk management.

## Project Structure
- `index.html`: The main user interface.
- `style.css`: Modern, dark-themed styling.
- `script.js`: UI logic and portfolio chart handling.
- `chat.js`: Integration with the Groq API for AI capabilities.

## 🔒 Security Warning: API Keys
**NEVER commit your API key to GitHub!**
Since this project currently makes API calls directly from the frontend (`chat.js`), any API key placed in the file will be publicly visible to anyone who visits your website. 

For local development:
1. Temporarily replace `'YOUR_API_KEY_HERE'` in `chat.js` with your actual Groq API key.
2. **IMPORTANT:** Before committing and pushing to GitHub, revert it back to `'YOUR_API_KEY_HERE'`.

## 🚀 How to Deploy on Vercel

1. **Push to GitHub**:
   - Make sure your API key is removed from `chat.js`.
   - Initialize a Git repository, commit your files, and push them to a new repository on GitHub.
   
2. **Deploying to Vercel**:
   - Go to [Vercel](https://vercel.com/) and log in.
   - Click **Add New...** > **Project**.
   - Import your GitHub repository.
   - Vercel will automatically detect that this is a static HTML/JS project.
   - Leave the Framework Preset as `Other` or `Static`.
   - Click **Deploy**.

### Securing Your API Key in Vercel (Advanced Setup)
Since Vercel static deployments do not hide frontend code, to properly secure your API key on Vercel, you need to use a Backend Serverless Function.

If you want to do this:
1. Create a folder named `api` in your project root.
2. Inside `api`, create a file named `chat.js` (this will run on the server).
3. Move the API fetching logic from the frontend to this server file.
4. Then, you can safely add `GROQ_API_KEY` to your Vercel Environment Variables (`Settings` > `Environment Variables`).
5. Update your frontend to send requests to `/api/chat` instead of directly to Groq.

If you need help setting up the Vercel serverless function to securely hide your API key, you can ask for it!
