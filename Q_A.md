# EnergyLens: 100-Question Ultimate Viva & Review Guide

This document is a comprehensive "Viva-Voce" preparation bank covering every aspect of the EnergyLens project.

---

## 📂 Section 1: Project Overview & Motivation (1-10)

1. **Q: What is EnergyLens?**  
   **A:** A full-stack SaaS platform for Indian households to track, analyze, and forecast electricity usage and costs.
2. **Q: What problem does it solve?**  
   **A:** It addresses the lack of transparency in electricity billing and helps users identify high-consumption patterns to save money.
3. **Q: Who is the target audience?**  
   **A:** Indian homeowners and small business owners who want to manage their utility expenses.
4. **Q: Why Vite instead of Create React App?**  
   **A:** Vite offers significantly faster build times and a better development experience (HMR).
5. **Q: Why Node.js for the backend?**  
   **A:** Its non-blocking I/O model is perfect for handling multiple API requests and real-time data processing.
6. **Q: How does the app handle state-specific tariffs?**  
   **A:** We store unique slab rates for each state in MongoDB and fetch them during calculations.
7. **Q: What is the "SaaS" element here?**  
   **A:** The tiered access (Free vs. Premium) and the subscription-based forecasting feature.
8. **Q: Why did you rename the directories to "Frontend" and "Backend"?**  
   **A:** For better clarity and to follow industry standards for monorepo-style structures.
9. **Q: What's the core "Innovation" in this project?**  
   **A:** Combining appliance-level tracking with localized Indian billing engine logic.
10. **Q: Is the payment real?**  
    **A:** No, we use a "Mock Payment" simulation to demonstrate the subscription flow without requiring real credit cards.

---

## 🛡️ Section 2: Shrey Pandey (Backend & Data) (11-35)

11. **Q: Which database did you use and why?**  
    **A:** MongoDB, because its flexible JSON-like schema is ideal for varying energy data structures.
12. **Q: What is the purpose of Mongoose?**  
    **A:** It provides a schema-based solution to model application data and includes built-in validation.
13. **Q: Explain the `User` schema.**  
    **A:** It tracks user identity, state, tariff preferences, monthly budget, and subscription status.
14. **Q: How do you store electricity readings?**  
    **A:** In a `Usage` model linked to a `Household` ID, storing date and kWh values.
15. **Q: What is JWT?**  
    **A:** JSON Web Token, used for securely transmitting information between parties as a JSON object.
16. **Q: Where is the JWT stored on the frontend?**  
    **A:** In `localStorage`.
17. **Q: How do you verify the JWT on the backend?**  
    **A:** Using a `protect` middleware that decodes the token and attaches the user object to the request.
18. **Q: How do you handle password security?**  
    **A:** Passwords are never stored as plain text. We use `bcryptjs` to hash them before saving to the DB.
19. **Q: What is 'Salt' in hashing?**  
    **A:** A random string added to the password before hashing to prevent rainbow table attacks.
20. **Q: Explain the `billingService.ts` function.**  
    **A:** It iterates through tariff slabs, calculates sub-totals for each kWh range, and sums them up.
21. **Q: How do you handle CORS?**  
    **A:** We use the `cors` middleware in Express to allow requests specifically from `localhost:5173`.
22. **Q: What is `nodemon`?**  
    **A:** A tool that restarts the node application automatically when file changes are detected.
23. **Q: Explain the custom `requirePremium` middleware.**  
    **A:** It checks the `user.role` from the request; if not 'premium' or 'admin', it blocks the API call with a 403 error.
24. **Q: How did you implement the profile picture upload?**  
    **A:** Using `multer` to handle `multipart/form-data` and saving files to a local `/uploads` folder.
25. **Q: How do you serve those uploaded images?**  
    **A:** Using `express.static('uploads')` in the main `index.ts` file.
26. **Q: What happens if a user uploads a 10MB file?**  
    **A:** The `multer` limit (5MB) will trigger an error, which we catch and return as a 400 response.
27. **Q: Explain the Forgot Password flow.**  
    **A:** We generate a unique crypto token, hash it, store it in the DB with an expiry, and (mock) send a reset link.
28. **Q: How do you handle errors in Express?**  
    **A:** Using `try-catch` blocks in controllers and a centralized error handling pattern.
29. **Q: What is an "Index" in MongoDB?**  
    **A:** A data structure that improves the speed of data retrieval operations, like indexing `email` for fast login.
30. **Q: How do you seed the initial tariff data?**  
    **A:** I created a `tariffRates.ts` script that populates the DB with slab data for states like Delhi and Karnataka.
31. **Q: What is `ts-node`?**  
    **A:** It allows us to execute TypeScript files directly without a separate compilation step.
32. **Q: How do you handle "Auto-Renew" for subscriptions?**  
    **A:** We use a boolean flag in the User model and logic in the `AuthContext` to update it via API.
33. **Q: What is the purpose of `app.use(express.json())`?**  
    **A:** It parses incoming requests with JSON payloads and makes them available in `req.body`.
34. **Q: How do you link a User to a Household?**  
    **A:** Using a `user: mongoose.Schema.Types.ObjectId` reference in the Household schema.
35. **Q: Why use `select('-password')` in queries?**  
    **A:** To ensure that the hashed password is never pulled into the application memory or sent over the network unless necessary.

---

## 🎨 Section 3: Ishita Tiwari (Frontend & UI) (36-60)

36. **Q: What are React Hooks?**  
    **A:** Functions that let you "hook into" React state and lifecycle features from function components (e.g., `useState`, `useEffect`).
37. **Q: Why use `useEffect` for data fetching?**  
    **A:** It allows us to perform "side effects" like API calls once the component has mounted.
38. **Q: Explain the `AuthContext`.**  
    **A:** It provides global access to the current `user` object and functions like `login`, `logout`, and `updateProfile`.
39. **Q: What is Tailwind CSS?**  
    **A:** A utility-first CSS framework that allows for rapid UI building directly in the HTML/JSX.
40. **Q: How did you create the layout transitions?**  
    **A:** Using `framer-motion`'s `<AnimatePresence>` and `<motion.div>` for smooth entry/exit animations.
41. **Q: Explain the Dashboard's "Glassmorphism" classes.**  
    **A:** We use `bg-white/10`, `backdrop-blur-xl`, and `border-white/20` to create the frosted glass look.
42. **Q: What library did you use for the charts?**  
    **A:** `Recharts`, chosen for its declarative React-first approach and high degree of customization.
43. **Q: How do you make the app responsive?**  
    **A:** By using Tailwind's responsive prefixes (e.g., `md:flex-row`, `sm:w-full`) to adapt layouts for mobile and desktop.
44. **Q: Explain the `useTheme` hook.**  
    **A:** It provides the current theme state ('light' or 'dark') and a function to toggle it, syncing with `localStorage`.
45. **Q: Describe the electricity line animation.**  
    **A:** It's an SVG path animated with Framer Motion, where the `strokeDashoffset` is looped to simulate "flowing current".
46. **Q: How do you handle form validation?**  
    **A:** Using local state to track input values and conditional rendering to show error messages (e.g., "Invalid email").
47. **Q: What is `react-router-dom`?**  
    **A:** A library for handling routing and navigation in a React Single Page Application (SPA).
48. **Q: How do you protect routes like `/dashboard`?**  
    **A:** By wrapping them in a `ProtectedRoute` component that checks for a `user` in the `AuthContext`.
49. **Q: Explain the "Floating Feature Tags" on the Landing page.**  
    **A:** These are absolute-positioned `motion.div` elements that hover with a "y" axis animation.
50. **Q: How do you display different colors for different user plans?**  
    **A:** We use a mapping object (`planColors`) that associates 'premium' with gold/amber and 'free' with blue/gray.
51. **Q: What is the purpose of `clsx` or `tailwind-merge`?**  
    **A:** To dynamically join CSS class names and resolve conflicts efficiently.
52. **Q: How do you handle image previews before upload?**  
    **A:** We use `URL.createObjectURL(file)` to generate a temporary URL for the selected file.
53. **Q: Explain the onboarding flow for Google users.**  
    **A:** If a Google login is successful but the user hasn't set their `state`, we redirect them to a specific onboarding page or Settings.
54. **Q: How do you ensure the charts look good in Dark Mode?**  
    **A:** We pass the `theme` from `ThemeContext` into the charts to dynamically change stroke and fill colors.
55. **Q: What is a "Single Page Application" (SPA)?**  
    **A:** A web app that loads a single HTML page and updates content dynamically without refreshing.
56. **Q: Why use `lucide-react` for icons?**  
    **A:** They are lightweight, customizable, and integrate perfectly as React components.
57. **Q: How do you maintain the expanded/collapsed state of the Sidebar?**  
    **A:** Using a simple boolean `useState` in the `Sidebar` component.
58. **Q: Explain the "Budget Alert" logic in the UI.**  
    **A:** If `currentUsageCost > monthlyBudget`, we highlight the cost in red and show an alert icon.
59. **Q: Why use Framer Motion for the login page transitions?**  
    **A:** It adds a premium feel that makes the app stand out compared to static login pages.
60. **Q: How do you handle "Logout" in the frontend?**  
    **A:** By clearing the JWT from `localStorage` and resetting the `user` state to `null`.

---

## 🔄 Section 4: Integration & Shared Knowledge (61-80)

61. **Q: How does the Frontend talk to the Backend?**  
    **A:** Using `axios` to make HTTP requests (GET, POST, PUT, DELETE) to the backend's REST API.
62. **Q: What is the significance of the 5001 and 5173 ports?**  
    **A:** 5001 is where the backend server listens, and 5173 is the default port for the Vite frontend.
63. **Q: How do you handle 401 Unauthorized errors globally?**  
    **A:** (Shrey/Ishita) We use axios interceptors to automatically log out the user if the backend says their token is invalid.
64. **Q: What was the "Google Profile Overwrite" bug?**  
    **A:** (Shared) Every refresh/login would reset an uploaded photo to the Google photo. We fixed this with a backend check.
65. **Q: Explain how "State-wise Tariffs" move from DB to Screen.**  
    **A:** Backend calculates cost using slabs -> API returns cost -> Frontend displays it in maps and charts.
66. **Q: How did you solve the port collision issue?**  
    **A:** (Shared) We used `lsof` and `kill` commands to stop stale processes from old directory runs.
67. **Q: Why is "Responsiveness" a priority?**  
    **A:** Because energy tracking is often done on-the-go via mobile phones.
68. **Q: What is a "Monorepo" approach?**  
    **A:** Keeping both frontend and backend code in the same project root for easier management.
69. **Q: How do you handle "Loading States"?**  
    **A:** By using `isLoading` booleans and rendering spinners or skeleton screens.
70. **Q: Describe the "Upgrade" flow.**  
    **A:** Frontend -> `POST /api/subscription/upgrade` -> Backend updates role -> Context refreshes.
71. **Q: What is the "Me" endpoint?**  
    **A:** `/api/auth/me` returns the current user profile based on the JWT sent in the header.
72. **Q: How do you handle the "Auto-Switch" to Dark Mode?**  
    **A:** We check `window.matchMedia('(prefers-color-scheme: dark)')` on the first load.
73. **Q: What is "Signal Processing" (Conceptual)?**  
    **A:** Identifying specific appliance "signatures" from total power consumption data.
74. **Q: Describe the "Peak Hour" logic.**  
    **A:** Alerting users if they consume high energy during hours where tariffs are potentially higher.
75. **Q: How do you secure the `/uploads` folder?**  
    **A:** By ensuring only authenticated users can trigger the upload endpoint.
76. **Q: What is "Schema Validation"?**  
    **A:** Ensuring that incoming data (like email or kWh) follows the correct format before hitting the DB.
77. **Q: Why use `path.join` for file paths?**  
    **A:** To ensure cross-platform compatibility (Windows vs Mac/Linux).
78. **Q: What is the "Active Household" concept?**  
    **A:** Allowing a user to follow multiple properties, but tracking one on the dashboard at a time.
79. **Q: How do you handle "Unit Testing" (Conceptual)?**  
    **A:** Testing individual functions like `calculateBill` in isolation with mock data.
80. **Q: Describe the "Forecast" algorithm.**  
    **A:** (Ishita/Shrey) Currently, it uses linear regression of the last 7 days of data to project a 30-day usage.

---

## 🚀 Section 5: Teacher's Specialist Questions (81-100)

81. **Q: What is Middleware in Express?**  
    **A:** Functions that have access to the request/response objects and can modify them or terminate the cycle.
82. **Q: Explain the difference between `npm install` and `npm install --save-dev`.**  
    **A:** Normal install is for production code; `--save-dev` is for tools used only during development (like `typescript`).
83. **Q: How would you scale this app to 1 million users?**  
    **A:** Implement DB sharding, use a Redis cache for tariffs, and deploy on a Load Balancer (AWS/Azure).
84. **Q: What is "Data Normalization" in MongoDB?**  
    **A:** Splitting data into different collections (User, Household, Usage) and linking them with IDs.
85. **Q: Why is TypeScript better than plain JavaScript for this project?**  
    **A:** It prevents common bugs like "Cannot read property of undefined" through static typing.
86. **Q: Explain "Prop Drilling" and how you avoided it.**  
    **A:** We used the Context API (`AuthContext`) instead of passing user data through 10 layers of components.
87. **Q: What is a "REST API"?**  
    **A:** An architectural style that uses standard HTTP methods to manage resources identified by URLs.
88. **Q: How do you handle session persistence?**  
    **A:** By storing the JWT in `localStorage` and checking its validity on every page load.
89. **Q: Explain the `git` workflow you followed.**  
    **A:** We used branching and commits to track changes, ensuring Shrey and Ishita could work in parallel.
90. **Q: What is a "Promise" in JavaScript?**  
    **A:** An object representing the eventual completion (or failure) of an asynchronous operation.
91. **Q: How do you handle "Asynchronous" code in the backend?**  
    **A:** Using `async` and `await` keywords for cleaner, readable code compared to callbacks.
92. **Q: Describe the "Appliance Health" concept.**  
    **A:** Detecting if an appliance (like a fridge) is consuming more than its typical signature, indicating a fault.
93. **Q: Why use absolute paths in the backend (`__dirname`)?**  
    **A:** To ensure the server can find files regardless of which directory it was started from.
94. **Q: What is the "Vite Config" file for?**  
    **A:** To configure plugins (like React), handle aliases, and define the dev server port.
95. **Q: How do you handle user "Onboarding"?**  
    **A:** We check if the `activeHousehold` field is null and redirect to a "Get Started" screen if so.
96. **Q: What is "Payload" in a JWT?**  
    **A:** The middle section of the token that contains claims (like `userId`) encoded in Base64.
97. **Q: How would you implement "Real-Time" alerts?**  
    **A:** Using `Socket.io` to push notifications from the server to the frontend instantly.
98. **Q: What is "Environment Variable Precedence"?**  
    **A:** The order in which the system looks for variables (e.g., OS variables override `.env` files).
99. **Q: If you had one more month, what would you add?**  
    **A:** Real-time hardware integration (ESP32), PDF bill generation, and multi-language support.
100. **Q: Summarize the project in one sentence.**  
     **A:** EnergyLens is a premium, full-stack energy management suite designed to empower Indian households through data-driven insights.

---

## 🚀 Section 6: Advanced & Specialist Technical Concepts (101-150)

101. **Q: What is "Dependency Injection" in the backend?**  
     **A:** It's a pattern where a class receives its dependencies from an external source rather than creating them itself, seen in how we pass the Mongoose model to our services.
102. **Q: Explain the `key` prop in React lists.**  
     **A:** It helps React identify which items have changed, been added, or removed, which is vital for performance during re-renders of the Appliance list.
103. **Q: What is a "Race Condition" in API calls?**  
     **A:** When two or more requests are sent, and the response that arrives last overwrites the correct data. We handle this with cleanup functions in `useEffect`.
104. **Q: How do you handle "CORS" preflight requests?**  
     **A:** The `cors` middleware automatically responds to OPTIONS requests, which the browser sends before a POST/PUT to verify permissions.
105. **Q: What is the "Event Loop" in Node.js?**  
     **A:** The mechanism that allows Node to perform non-blocking I/O operations by offloading tasks to the system kernel.
106. **Q: Why use `SVG` for the electricity line instead of a PNG?**  
     **A:** SVGs are resolution-independent (no blurring) and their paths can be easily manipulated via CSS and Framer Motion.
107. **Q: Explain "Higher Order Components" (HOC).**  
     **A:** A function that takes a component and returns a new component, often used for adding authentication checks to pages.
108. **Q: What is the "Virtual DOM"?**  
     **A:** A lightweight copy of the real DOM that React uses to figure out exactly which parts of the UI need to be updated efficiently.
109. **Q: How do you handle "Environment Secrets" in deployment (e.g., Vercel/Render)?**  
     **A:** We use the platform's Environment Variable settings instead of a `.env` file for maximum security.
110. **Q: Explain the `useMemo` hook.**  
     **A:** It memoizes the result of a calculation, preventing heavy bill calculations from running on every single re-render.
111. **Q: What is "Deep Linking" in a web app?**  
     **A:** Allowing a user to navigate directly to a specific page (like `/settings/profile`) and having the app load the correct state.
112. **Q: How do you prevent "XSS" (Cross-Site Scripting) attacks?**  
     **A:** React automatically escapes all data rendered in JSX, preventing malicious scripts from being executed.
113. **Q: What is "SQL Injection" and why is MongoDB immune to it?**  
     **A:** SQL Injection targets relational query syntax. MongoDB uses BSON and object-style queries, which don't allow concatenating raw strings into commands.
114. **Q: Explain the `useRef` hook.**  
     **A:** It provides a way to access a DOM element directly or to store a mutable value that doesn't trigger a re-render.
115. **Q: What is "Hydration" in the context of React?**  
     **A:** The process of attaching event listeners to the server-rendered HTML to make it interactive.
116. **Q: How do you handle "Optimistic UI" updates?**  
     **A:** Updating the UI (like adding an appliance) immediately before the server confirms success, making the app feel faster.
117. **Q: Explain "Rate Limiting" on a Search API.**  
     **A:** Limiting the number of requests a single IP can make to prevent DDoS attacks or scraping.
118. **Q: What is the difference between `PUT` and `PATCH`?**  
     **A:** `PUT` replaces the entire resource, while `PATCH` is used for partial updates (like just changing a phone number).
119. **Q: Explain the `express-validator` library.**  
     **A:** A set of middleware that simplifies validating and sanitizing user input on the backend.
120. **Q: What is a "State Machine"?**  
     **A:** A mathematical model of computation used to manage complex UI states (e.g., 'idle' -> 'loading' -> 'success' or 'error').
121. **Q: Explain "Lazy Loading" of components.**  
     **A:** Using `React.lazy` and `Suspense` to load heavy pages only when the user navigates to them, improving initial load time.
122. **Q: What is "Semantic HTML"?**  
     **A:** Using tags like `<header>`, `<footer>`, and `<main>` instead of just `<div>`, which is better for SEO and accessibility.
123. **: How do you handle "Z-Index" conflicts in a Glassmorphic UI?**  
     **A:** By using Tailwind's `z-` classes and ensuring parent containers have the correct stacking context.
124. **Q: Explain "Debouncing" in a Search Bar.**  
     **A:** Waiting for the user to stop typing for 300ms before sending the API request to save server resources.
125. **Q: What is "Normalization" of state?**  
     **A:** Storing data in a flat structure (e.g., an object with IDs as keys) to make updates and lookups faster.
126. **Q: Explain the `next()` function in Express middleware.**  
     **A:** It tells Express to move to the next middleware in the stack; without it, the request will hang.
127. **Q: What is "Base64" encoding?**  
     **A:** A binary-to-text encoding scheme used to represent images or data in a string format (e.g., for profile photo data).
128. **Q: Explain the "Box Model" in CSS.**  
     **A:** It defines how every element is a rectangular box with content, padding, border, and margin.
129. **Q: What is "Bearer Token" authentication?**  
     **A:** A standard for passing a JWT in the `Authorization` header as `Bearer <token>`.
130. **Q: Explain "Micro-interactions".**  
     **A:** Small animations (like buttons glowing on hover) that provide feedback and make the app feel alive.
131. **Q: What is "Tree Shaking"?**  
     **A:** A build process optimization that removes unused code from final bundles, performed automatically by Vite.
132. **Q: Explain the difference between `local` and `session` storage.**  
     **A:** Local storage persists even after the browser is closed; Session storage is cleared when the tab is closed.
133. **Q: What is "Atomic Design"?**  
     **A:** A methodology for building design systems by breaking components into Atoms, Molecules, and Organisms.
134. **Q: Explain "Strict Mode" in React.**  
     **A:** A tool for highlighting potential problems in an application, such as side effects running twice.
135. **Q: What is a "Web Worker"?**  
     **A:** A background thread that can run heavy calculations without blocking the main UI thread.
136. **Q: Explain the `Object.assign` vs "Spread Operator".**  
     **A:** Both merge objects, but the spread operator (`...`) is more modern and commonly used in React state updates.
137. **Q: What is "Responsive Typography"?**  
     **A:** Using units like `clamp()` or `rem` that scale font sizes based on the screen width.
138. **Q: Explain "Error Boundaries" in React.**  
     **A:** Special components that catch JavaScript errors anywhere in their child component tree and display a fallback UI.
139. **Q: What is "JSONP"?**  
     **A:** An old technique for making cross-domain requests, now replaced by CORS.
140. **Q: Explain the "Single Source of Truth" principle.**  
     **A:** Storing each piece of data (like the user plan) in only one place (the AuthContext) to keep the UI consistent.
141. **Q: What is "Currying" in JavaScript?**  
     **A:** A functional programming technique where a function returns another function with partial arguments applied.
142. **Q: Explain "Static Site Generation" (SSG) vs "Server Side Rendering" (SSR).**  
     **A:** SSG generates pages at build time; SSR generates them on every request. Our app uses CSR (Client Side Rendering).
143. **Q: What is "Flash of Unstyled Content" (FOUC)?**  
     **A:** When the browser displays the raw HTML before the CSS or JS loads, which we prevent by using an initial loading screen.
144. **Q: Explain the "Populate" method in Mongoose.**  
     **A:** It allows us to automatically replace an ID in a document with the full document from another collection.
145. **Q: What is "Immutability" and why is it important in React?**  
     **A:** Not changing existing objects directly; instead, creating new copies. This allows React to detect state changes perfectly.
146. **Q: Explain "Modular CSS".**  
     **A:** Writing scoped CSS to prevent styles from one component accidentally affecting another.
147. **Q: What is "Content Security Policy" (CSP)?**  
     **A:** A security layer that helps detect and mitigate certain types of attacks, like XSS and data injection.
148. **Q: Explain the `async/await` syntax vs `.then()`.**  
     **A:** `async/await` is "syntactic sugar" that makes asynchronous code look and behave like synchronous code.
149. **Q: What is "Lighthouse" in Chrome DevTools?**  
     **A:** A tool for auditing the performance, accessibility, and SEO of a web application.
150. **Q: What is the most important lesson you learned in this project?**  
     **A:** (Unified Answer) That building a full-stack app is 20% writing code and 80% planning architecture and handling edge cases to create a seamless user experience.
