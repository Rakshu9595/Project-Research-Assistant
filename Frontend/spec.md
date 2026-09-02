# COMPLETE FRONTEND DEVELOPMENT PROMPT — RESEARCH ASSISTANT

Build the complete frontend for my **AI Research Assistant / Adaptive Document-Aware Research Assistant** project.

## IMPORTANT TECHNOLOGY REQUIREMENTS

Use ONLY:

* HTML5
* CSS3
* Vanilla JavaScript
* Bootstrap 5
* Bootstrap Icons
* Fetch API

DO NOT use:

* React
* Next.js
* Vue
* Angular
* TypeScript
* Tailwind CSS
* JSX
* Any frontend framework

The frontend must work as a normal static website and communicate with my existing Node.js/Express backend through REST APIs.

---

# EXISTING FRONTEND STRUCTURE

Do NOT change the folder structure.

Complete the files inside:

```text
Frontend/
│
├── html/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── documents.html
│   ├── chat.html
│   └── research.html
│
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── chat.css
│   └── research.css
│
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── documents.js
│   ├── chat.js
│   ├── research.js
│   └── utils.js
│
└── assets/
    ├── images/
    └── icons/
```

If files are empty, write the required implementation into them.

Do not create a React project.

---

# PROJECT PURPOSE

The application is an intelligent research assistant.

The main workflow is:

```text
User
 ↓
Register / Login
 ↓
Dashboard
 ↓
Upload project reports
 ↓
Ask questions
 ↓
System checks uploaded documents
 ↓
If relevant information exists:
    Document-grounded RAG answer
 ↓
If information is not available:
    General AI answer
 ↓
If user wants research papers:
    Academic research search
 ↓
Display papers with relevance, authors, year,
abstract/summary and source links
```

The frontend should clearly communicate the difference between:

1. Document-grounded answers
2. General AI answers
3. Academic research results

---

# DESIGN REQUIREMENTS

Create a modern, professional academic/AI SaaS interface.

The UI should feel similar to a polished research/productivity application.

Design principles:

* Clean
* Minimal
* Professional
* Modern
* Academic
* Trustworthy
* Easy to navigate
* Beginner-friendly
* Responsive
* Accessible
* Neat spacing
* Consistent typography
* Consistent cards
* Consistent buttons
* Consistent icons

Avoid:

* Excessive animations
* Overly bright colors
* Clutter
* Huge gradients everywhere
* Unnecessary decorative elements
* Complicated navigation
* Poor mobile layouts

Use a restrained professional color palette.

Use Bootstrap utilities wherever practical.

---

# RESPONSIVENESS

The entire frontend MUST be responsive.

It must work properly on:

* Desktop
* Laptop
* Tablet
* Mobile

Test layouts conceptually at:

```text
1920px
1440px
1024px
768px
576px
375px
```

No horizontal scrolling.

Cards, tables, forms, navigation and chat areas must adapt to small screens.

On mobile:

* Navbar becomes a Bootstrap mobile navbar
* Sidebar becomes collapsible
* Cards stack vertically
* Tables become responsive
* Chat interface remains usable
* Buttons remain touch-friendly
* Forms use full available width

---

# ACCESSIBILITY

Follow modern HTML5 accessibility practices.

Use:

* semantic HTML
* `<header>`
* `<nav>`
* `<main>`
* `<section>`
* `<article>`
* `<footer>`

Use:

* proper labels for inputs
* meaningful button text
* ARIA labels where appropriate
* keyboard-friendly controls
* visible focus states
* sufficient contrast
* alt text for images
* accessible modal/dialog behavior

Do not use clickable `<div>` elements where a button/link is appropriate.

---

# GLOBAL NAVIGATION

Create a consistent navigation experience across authenticated pages.

Navbar should contain:

* Research Assistant logo/name
* Dashboard
* Documents
* Chat
* Research
* User profile/menu
* Logout

For unauthenticated pages:

* Home
* Features
* Login
* Register

Use Bootstrap Icons.

Example icons:

* Dashboard → `bi-speedometer2`
* Documents → `bi-file-earmark-text`
* Chat → `bi-chat-dots`
* Research → `bi-journal-text`
* Logout → `bi-box-arrow-right`
* Upload → `bi-cloud-upload`
* Search → `bi-search`

---

# 1. index.html

Create a professional landing page.

Sections:

## Hero

Display:

**AI Research Assistant**

Headline:

**Turn Your Project Reports Into an Intelligent Research Workspace**

Explain that the system can:

* Understand uploaded project reports
* Answer questions using document evidence
* Fall back to general AI when information is unavailable
* Discover relevant academic research papers

Buttons:

* Get Started
* Login

## Features

Create cards for:

### Document Intelligence

Upload PDF, DOCX and TXT project reports.

### Evidence-Based Answers

Ask questions and receive answers grounded in uploaded documents.

### Intelligent AI Fallback

When the answer is not available in uploaded documents, provide a clearly labelled general AI answer.

### Academic Research

Find relevant research papers automatically.

### Source Citations

Show document name, page and section whenever available.

### Research Discovery

Help users discover related academic literature.

## How It Works

Show:

```text
1. Upload
2. Ask
3. Retrieve
4. Verify
5. Answer
6. Research
```

Use a clean visual step layout.

## Research Architecture

Briefly explain:

```text
Documents → RAG → Evidence

Question → Router → RAG / General AI / Research

Research Query → Academic APIs → Ranked Papers
```

## CTA

Encourage users to create an account.

## Footer

Include:

* Project name
* Short description
* Navigation links
* Copyright
* Technology information

---

# 2. login.html

Create a clean professional login page.

Include:

* Email
* Password
* Show/hide password
* Remember me
* Login button
* Register link
* Forgot password UI placeholder

Add client-side validation.

Display friendly validation errors.

Show loading state while submitting.

Prevent duplicate submissions.

After successful login:

```text
Save JWT token
Save user information if returned
Redirect to dashboard.html
```

Use `auth.js` and `api.js`.

Do not hardcode fake credentials.

---

# 3. register.html

Create a professional registration page.

Fields:

* Full name
* Email
* Password
* Confirm password

Validation:

* Required fields
* Valid email
* Minimum password length
* Password confirmation
* Friendly error messages

Add password strength indicator.

Show/hide password.

After successful registration:

Redirect to:

```text
login.html
```

Display a success notification.

---

# 4. dashboard.html

Create the main authenticated dashboard.

Layout:

```text
Sidebar
   ↓
Main Dashboard
```

Dashboard should include:

## Welcome section

Example:

```text
Welcome back 👋

Continue your research and explore your project knowledge.
```

Use the actual logged-in user's name when available.

## Statistics cards

Display:

* Total Documents
* Processed Documents
* Conversations
* Research Papers

If backend data is unavailable, display graceful empty states rather than fake statistics.

## Quick Actions

Buttons:

* Upload Document
* Start Chat
* Research Papers

## Recent Documents

Show:

* Filename
* Type
* Upload date
* Processing status
* Action

## Recent Conversations

Show:

* Conversation title
* Last activity
* Open button

## Research Activity

Show recently searched research topics/papers if API data exists.

---

# 5. documents.html

Create a professional document management page.

## Header

Title:

**My Documents**

Subtitle:

**Upload and manage your project reports**

## Upload area

Create a large drag-and-drop upload component.

Supported:

```text
PDF
DOCX
TXT
```

Display:

```text
Drag & drop your report here
or
Browse Files
```

Show:

* selected filename
* file size
* file type
* upload progress
* processing status

## Document list

Columns:

* Document
* Type
* Size
* Status
* Uploaded
* Actions

Actions:

* View
* Chat
* Delete

## States

Handle:

* loading
* empty
* uploading
* processing
* processed
* failed
* deleting

## Cloudinary

The frontend should be designed to work with the backend/Cloudinary upload flow.

Do NOT expose:

```text
CLOUDINARY_API_SECRET
```

or any backend secret in frontend JavaScript.

Use backend API endpoints for protected operations.

---

# 6. chat.html

This is one of the most important pages.

Create a modern AI chat interface.

Layout:

```text
Sidebar                 Chat
─────────               ─────────────
Conversations           Header
                        Messages
New Chat                Sources
History                 Input
```

## Chat header

Display:

**Research Assistant**

Status:

```text
Ready
```

## Empty state

Before chatting:

```text
Ask questions about your project reports

Upload documents and ask questions based on their content.
```

Suggestions:

* What is the main objective of this project?
* Explain the methodology.
* What technologies are used?
* Summarize the findings.
* What are the limitations?

## Message UI

User messages:

* Right aligned

Assistant messages:

* Left aligned

Use clean message bubbles.

## Answer modes

Every assistant response should clearly display its mode.

For example:

### Document Grounded

Badge:

```text
Document Grounded
```

Show:

* Answer
* Confidence if provided
* Sources

Sources example:

```text
project-report.pdf
Page 12
Methodology
```

### General AI

Badge:

```text
General AI
```

Clearly explain:

```text
This answer was generated from general AI knowledge because
relevant information was not found in your uploaded documents.
```

### Research

Badge:

```text
Research
```

Display research results separately.

## Source citations

Make citations clickable where appropriate.

Example:

```text
[Project Report, p.12]
```

Show source cards containing:

* filename
* page
* section

## Input

Create:

* textarea
* send button
* attach document button if appropriate

Textarea should support:

```text
Enter → send
Shift + Enter → new line
```

Do not submit empty messages.

Show typing/loading indicator.

Disable send while request is processing if appropriate.

Handle API errors gracefully.

---

# 7. research.html

Create a professional academic research discovery page.

Header:

**Academic Research**

Subtitle:

**Discover papers related to your project**

## Search area

Include:

* Search input
* Search button
* Research topic suggestions
* Optional year filter
* Optional source filter

## Project-aware research

Provide a button:

**Find Research Related to My Project**

This should call the backend research endpoint.

The backend may infer topics from uploaded documents.

## Research results

Each paper card should show:

* Paper title
* Authors
* Publication year
* Abstract or shortened abstract
* Relevance score
* Source
* External paper link
* Why this paper is relevant

Example:

```text
Research Paper Title

Authors:
John Doe, Jane Doe

2024

Relevance: 92%

Abstract:
...

Why it is relevant:
This paper discusses methods related to...
```

Use badges for:

* Highly Relevant
* Relevant
* Moderate

Add:

* loading state
* no results state
* error state

Add pagination or Load More if supported by backend.

---

# JAVASCRIPT ARCHITECTURE

Use the existing JS files correctly.

## api.js

Create a reusable API client.

Responsibilities:

* API base URL
* GET
* POST
* PUT
* DELETE
* Authorization header
* JSON handling
* Error handling

Example concept:

```js
const API_BASE_URL = "http://localhost:5000/api";
```

Make it easy to change later.

JWT should be automatically attached to authenticated requests.

Do not expose API secrets.

---

# auth.js

Responsibilities:

* login
* register
* logout
* token storage
* current user
* authentication checks
* redirect unauthenticated users
* redirect authenticated users where appropriate

Use:

```text
localStorage
```

for the JWT unless the backend architecture later changes to secure cookies.

---

# dashboard.js

Responsibilities:

* Load dashboard statistics
* Load recent documents
* Load recent conversations
* Render loading states
* Render empty states
* Handle dashboard errors

---

# documents.js

Responsibilities:

* File selection
* File validation
* Drag and drop
* Upload
* Progress indicator
* Document list
* Delete document
* Refresh documents
* Status rendering

Validate file types:

```text
.pdf
.docx
.txt
```

Set a reasonable frontend file-size validation, but treat backend validation as authoritative.

---

# chat.js

Responsibilities:

* Load conversations
* Create conversation
* Send message
* Display messages
* Loading state
* Error state
* Source rendering
* Mode badges
* Auto-scroll
* Enter/Shift+Enter behavior

Expected conceptual response:

```json
{
  "mode": "document",
  "answer": "...",
  "sources": [
    {
      "filename": "project.pdf",
      "page": 12,
      "section": "Methodology"
    }
  ],
  "confidence": 0.93
}
```

Also support:

```json
{
  "mode": "general_ai",
  "answer": "...",
  "sources": []
}
```

Do not assume exact backend endpoint names if they are not yet implemented.

Create centralized API functions so endpoints can easily be changed later.

---

# research.js

Responsibilities:

* Research search
* Project-topic research
* API request
* Result rendering
* Relevance badges
* External paper links
* Loading states
* Empty states
* Error handling

Expected conceptual response:

```json
{
  "papers": [
    {
      "title": "...",
      "authors": [],
      "year": 2024,
      "abstract": "...",
      "relevance_score": 0.94,
      "source": "Semantic Scholar",
      "url": "...",
      "reason": "..."
    }
  ]
}
```

---

# utils.js

Create reusable utility functions for:

* Toast notifications
* Loading indicators
* Formatting dates
* Formatting file sizes
* Escaping HTML
* Debouncing
* Showing/hiding elements
* Authentication helpers where appropriate
* Error messages

IMPORTANT:

Escape user-generated content before inserting it into HTML.

Do not use unsafe `innerHTML` for untrusted content without sanitization.

---

# CSS

## style.css

Create global styling:

* CSS variables
* typography
* body
* buttons
* cards
* navbar
* footer
* forms
* badges
* alerts
* loading states
* responsive utilities
* focus states

Create a consistent design system.

Example CSS variables:

```css
:root {
    --primary-color: ...;
    --secondary-color: ...;
    --background-color: ...;
    --surface-color: ...;
    --text-color: ...;
    --muted-color: ...;
    --border-color: ...;
    --success-color: ...;
    --danger-color: ...;
}
```

Choose professional values.

---

## auth.css

Style:

* Login
* Register
* Auth card
* Form controls
* Password strength
* Authentication background
* Responsive layout

---

## dashboard.css

Style:

* Sidebar
* Dashboard cards
* Statistics
* Recent documents
* Quick actions
* Responsive sidebar

---

## chat.css

Style:

* Chat layout
* Conversation sidebar
* Messages
* User messages
* Assistant messages
* Source cards
* Input area
* Typing indicator
* Responsive mobile chat

---

## research.css

Style:

* Research search area
* Paper cards
* Relevance badges
* Abstract sections
* Source links
* Filters
* Responsive results

---

# BOOTSTRAP

Use Bootstrap 5 via CDN in HTML pages.

Use Bootstrap Icons via CDN.

Keep custom styling in the project's CSS files.

Do not put large CSS blocks directly inside HTML pages.

---

# PAGE LINKING

Because HTML files are inside:

```text
Frontend/html/
```

make sure links use correct relative paths.

For example:

From:

```text
html/index.html
```

to:

```text
html/login.html
```

use:

```html
<a href="login.html">
```

For CSS:

```html
<link rel="stylesheet" href="../css/style.css">
```

For JS:

```html
<script src="../js/api.js"></script>
```

Use the correct relative paths for every page.

---

# SECURITY REQUIREMENTS

Never put these in frontend files:

```text
JWT_SECRET
MONGO_URI
CLOUDINARY_API_SECRET
OPENAI_API_KEY
SEMANTIC_SCHOLAR_API_KEY
```

Never hardcode private API keys.

Never expose backend environment variables.

Never commit `.env`.

---

# USER EXPERIENCE

Every API operation must have proper UI states.

Implement:

```text
Loading
Success
Empty
Error
Retry
```

Examples:

If documents are loading:

```text
spinner + "Loading documents..."
```

If no documents:

```text
No documents yet.

Upload your first project report to get started.
```

If upload succeeds:

```text
Document uploaded successfully.
```

If an API fails:

```text
Something went wrong.
Please try again.
```

Do not show raw technical errors to normal users.

---

# TOAST NOTIFICATIONS

Create a reusable Bootstrap toast system.

Use for:

* Login success
* Registration success
* Upload success
* Delete success
* Chat errors
* Research errors
* Logout

---

# EMPTY STATES

Create polished empty states throughout the application.

Do not leave blank white sections.

Examples:

Documents:

```text
No documents uploaded yet.
Upload a project report to begin.
```

Chat:

```text
Start a conversation
Ask questions about your uploaded project reports.
```

Research:

```text
No research results yet.
Search for a topic to discover academic papers.
```

---

# ERROR HANDLING

Never allow JavaScript errors to break the entire page.

Use:

```js
try {
    ...
} catch (error) {
    ...
}
```

for asynchronous API operations.

Display user-friendly messages.

Log useful debugging information to the console during development.

---

# CODE QUALITY

Write clean, maintainable code.

Use:

* meaningful variable names
* reusable functions
* comments only where useful
* modular JavaScript
* no duplicated API logic
* no duplicated authentication logic
* no unnecessary global variables

Avoid writing everything inside one huge function.

---

# IMPORTANT BACKEND COMPATIBILITY

The Node.js backend and FastAPI AI service may still be under development.

Therefore:

* Keep API endpoints centralized in `api.js`
* Make endpoint paths easy to modify
* Do not fake successful backend responses
* Do not create fake AI answers
* Do not pretend a document was uploaded when the backend failed
* Handle unavailable endpoints gracefully

Use placeholder endpoint constants if necessary, but clearly isolate them so they can be updated later.

Suggested endpoint structure:

```text
/api/auth/register
/api/auth/login
/api/auth/me

/api/documents
/api/documents/upload
/api/documents/:id
/api/documents/:id/delete

/api/conversations
/api/conversations/:id
/api/chat

/api/research/search
/api/research/project
```

If the actual backend endpoints differ, keep the frontend API configuration centralized so they can be changed easily.

---

# FINAL REQUIREMENT

Complete ALL frontend files.

Do not only create a visual mockup.

The frontend must have:

* Working navigation
* Working form validation
* Authentication logic
* JWT handling
* API client
* Document upload UI
* Document management UI
* Chat interface
* Research interface
* Loading states
* Empty states
* Error states
* Toast notifications
* Responsive layouts
* Accessible components
* Clean code
* Correct relative paths

Do not use React.

Do not change the existing `Frontend` directory structure.

After implementation, review every HTML, CSS and JS file for:

* broken paths
* missing script imports
* missing CSS imports
* JavaScript errors
* invalid HTML
* responsiveness issues
* accessibility issues
* inconsistent UI
* duplicated code

The final result should look like a **professional production-ready academic AI research application**, not a basic student HTML project.
