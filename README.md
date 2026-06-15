<h1 align="center">Xeno AI-Native Mini CRM</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Mistral_AI-F472B6?style=for-the-badge&logoColor=white" alt="Mistral AI" />
</p>

<p align="center">
  <strong>Live Demo: <a href="https://xeno-ai-native-marketing-crm.vercel.app/">https://xeno-ai-native-marketing-crm.vercel.app/</a></strong>
</p>

<p align="center">
  An intelligent, AI-native Mini CRM designed for modern retail and Direct-to-Consumer brands. This platform enables marketers to ingest customer data, segment audiences using natural language, and deploy highly personalized A/B marketing campaigns across multiple messaging channels.
</p>

---

## ✦ Core Functionalities

- **Intelligent Segmentation (AI Copilot):** Uses Mistral LLM to translate natural language prompts into MongoDB queries to find specific audiences dynamically.
- **Automated A/B Message Drafting:** AI automatically drafts two variants of localized marketing messages tailored to the target audience.
- **Distributed Channel Simulation:** A decoupled, asynchronous message queue service simulates delivery delays, failures, and clicks via a webhook loop.
- **Real-Time Analytics Dashboard:** Tracks message lifecycles (`Pending`, `Delivered`, `Failed`, `Clicked`) and attributes theoretical revenue from clicked links.
- **Customer Data Ingestion:** Full CRUD capabilities to add, edit, and delete customer records and simulated purchase history.

---

## ✦ How To Use The Platform

1. **Access the CRM:** Navigate to the [Live Demo URL](https://xeno-ai-native-marketing-crm.vercel.app/) and click **Launch App**.
2. **View Customers:** Click on the **Customer Directory** tab to view your ingested shopper data. You can use the Search Bar to find specific users or click `+ Add Customer` to create new records.
3. **Use the Campaign Copilot:** Switch to the **Campaigns** tab. Under the "Campaign Copilot" section, select your preferred channel (Email, SMS, or WhatsApp).
4. **Prompt the AI:** Type a natural language command. For example: *`Find customers who spent over ₹1000 to send them a VIP discount code`*.
5. **Review AI Output:** The AI will instantly query the database to find matching customers, and present you with two distinct A/B message drafts tailored for the Indian market.
6. **Launch Campaign:** Review the drafts, edit them if necessary, and click **Launch A/B Campaign**.
7. **Monitor Performance:** Scroll to the **Dashboard Stats** at the top of the page. You will see the messages transition from `Pending` to `Delivered`, `Clicked`, or `Failed` in real-time as the simulated Channel Service processes them. Check the **Campaign History** table below for a granular log of every message sent.

---

## ✦ System Architecture

The application is engineered using a decoupled, service-oriented architecture:

- **Frontend Application (Client):** Developed with React.js and styled using Tailwind CSS, featuring a premium glassmorphism interface. Hosted on Vercel.
- **Core Backend Service:** A Node.js and Express API layer responsible for data ingestion, AI orchestration, and persisting campaign states in MongoDB. Hosted on Render.
- **Channel Delivery Service:** A specialized standalone microservice running a custom in-memory Message Queue. It simulates external provider latency and executes randomized probabilistic engagement outcomes, pinging the Core Backend via webhook endpoints. Hosted on Render.

---

## ✦ Important Production Notes (Render & UptimeRobot)

Because the Backend and Channel Services are deployed on **Render's Free Tier**, they automatically go to "sleep" after 15 minutes of inactivity. When asleep, attempting to launch a campaign may result in a "Failed to launch campaign" timeout error because the server takes 50+ seconds to spin back up.

To ensure 100% uptime and seamless demonstration of the platform, the services are monitored using **UptimeRobot**. 

If you are deploying this yourself, configure UptimeRobot to ping the following URLs every 14 minutes to prevent sleep:
1. **Channel Service Monitor:** `https://[YOUR_CHANNEL_SERVICE_URL].onrender.com/ping`
2. **Backend Service Monitor:** `https://[YOUR_BACKEND_SERVICE_URL].onrender.com/api/stats`

---

## ✦ Local Installation

**Prerequisites:** Node.js (v18+) and MongoDB.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashish-0314/Xeno-AI-Native-Marketing-CRM.git
   cd Xeno-AI-Native-Marketing-CRM
   ```

2. **Core Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with `MONGO_URI`, `MISTRAL_API_KEY`, and `CHANNEL_SERVICE_URL`. Run `npm run dev` to start the server.

3. **Channel Service Setup:**
   ```bash
   cd ../channel-service
   npm install
   ```
   Run `npm start` to initialize the simulated webhook delivery queue.

4. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Access the application at `http://localhost:5173`.
