MeroLoan – Installation Guide (Final Year Project)
==================================================

This guide explains how to run the MeroLoan application on your local machine.
MeroLoan is built using the MERN stack (MongoDB, Express.js, React.js, Node.js).

You can set it up using:
1. GitHub Repository
2. Local ZIP Folder (submitted with this project)

--------------------------------------------------
OPTION 1: USING GITHUB (Recommended for developers)
--------------------------------------------------

Step 1: Clone the project
--------------------------
Open terminal/command prompt and run:
git clone https://github.com/utshabthapa/FYP-MeroLoan.git

Step 2: Go to the project directory
-----------------------------------
cd FYP-MeroLoan

Step 3: Install backend dependencies
-------------------------------------
npm install

Step 4: Go to the frontend folder
----------------------------------
cd MeroLoan

Step 5: Install frontend dependencies
--------------------------------------
npm install

Step 6: Run the backend and frontend
-------------------------------------
Open two terminals:
• In the backend folder (FYP-MeroLoan), run:
  npm run dev

• In the frontend folder (MeroLoan), run:
  npm run dev


--------------------------------------------------
OPTION 2: USING ZIPPED PROJECT FOLDER
--------------------------------------------------

Step 1: Extract the zip file
-----------------------------
Inside the extracted folder, go to:
Development → FYP-Utshab-Thapa → FYP-MeroLoan

This is your main BACKEND folder.

Step 2: Open terminal in the FYP-MeroLoan folder
-------------------------------------------------
Run:
npm install

Then to start the backend server:
npm run dev

Step 3: Navigate to the FRONTEND folder
----------------------------------------
From inside the FYP-MeroLoan folder, run:
cd MeroLoan

Step 4: Install frontend dependencies
--------------------------------------
npm install

To start the frontend server:
npm run dev

Run the following link in your browser:
http://localhost:5173/

--------------------------------------------------
REQUIREMENTS
--------------------------------------------------
- Node.js and npm must be installed.
- MongoDB must be running (locally or remotely).
- If required, create a `.env` file in the backend root folder with:
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret

--------------------------------------------------
NOTES
--------------------------------------------------
• The backend folder is: FYP-MeroLoan
• The frontend folder is: MeroLoan (inside FYP-MeroLoan)
• Use `npm i` to install dependencies if not already installed
• Use `npm run dev` to run both frontend and backend

--------------------------------------------------
Developed by: Utshab Thapa
Supervisors: Mr. Niroj Sankhadev (External), Mr. Santosh Parajuli (Internal)
Institution: Itahari International College
--------------------------------------------------

