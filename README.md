# Deterministic Finite Automaton (DFA) Visualizer Engine

**Student:** Nguyễn Thịnh Khang
**Institution:** Vietnamese-German University (VGU)
**Project:** Chapter 2 & 3 Practice Test Exemption - Automata Visualization
**Tech Stack:** React.js (Vite), Tailwind CSS, Vis.js

---

## 📌 Project Overview
This project is an interactive web application built to visualize the execution flow of a Deterministic Finite Automaton (DFA). Users can define custom states, alphabets, and transition functions, and then visually track the computation of an input string step-by-step or via real-time auto-play.

---

## ⚙️ Prerequisites
To run this project locally, your machine must have **Node.js** installed. 
You can verify if Node.js is installed by opening your terminal or command prompt and running:
`node -v`

If it is not installed, please download it from the official website: [https://nodejs.org/](https://nodejs.org/)

---

## 🚀 How to Run the Project (Step-by-Step)

Because the `node_modules` folder (which contains the library dependencies) is extremely large, it has been excluded from this zip file. You will need to generate it locally using the following steps:

### Step 1: Extract the Folder
Ensure you have completely extracted the zipped folder to a location on your computer (e.g., your Desktop). Do not run the commands while still inside the `.zip` archive.

### Step 2: Open Your Terminal
Open your preferred terminal command line (Command Prompt, PowerShell, or the integrated terminal in VS Code). Navigate into the root directory of this extracted project folder. 

For example:
`cd path/to/extracted/dfa-visualizer`

### Step 3: Install Dependencies
Run the following command to read the `package.json` file and download the required libraries (React, Tailwind, and Vis.js):
```bash
npm install
```

### Step 4: Start the local development Server
```bash
npm run dev