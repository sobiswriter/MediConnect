# Project Overview

This project is a web application built with Next.js, designed to facilitate doctor-patient interactions. It features a dashboard for both doctors and patients, allowing for appointment management, profile updates, and more.

## Project Structure

*   `/` : Project root containing configuration files (`package.json`, `next.config.ts`, `tsconfig.json`, etc.).
*   `/.idx` : Development environment configuration (e.g., Nix).
*   `/.vscode` : VS Code settings.
*   `/docs` : Project documentation, including styling blueprints.
*   `/src` : Main source code directory.
    *   `/src/ai` : Code related to AI features (potentially using Genkit).
    *   `/src/app` : Next.js application root (pages, layouts, global styles).
    *   `/src/components` : Reusable UI components (shared and Radix UI based).
    *   `/src/contexts` : React contexts for global state management.
    *   `/src/hooks` : Custom React hooks.
    *   `/src/lib` : Utility functions and configurations (e.g., Firebase integration).

## Frameworks and Technologies

*   **Next.js:** React framework for server-side rendering, routing, etc.
*   **React:** Core UI library.
*   **TypeScript:** For static typing.
*   **Tailwind CSS:** For styling.
*   **Genkit:** Likely used for AI features.
*   **Radix UI:** Provides unstyled, accessible UI components.
*   **Firebase:** Integrated for backend services (authentication, Firestore, etc.).

## How to Clone and Run

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
    Replace `<repository-url>` with the actual URL of your project's GitHub repository.
2.  **Navigate to the project directory:**
    ```bash
    cd <project-directory>
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
4.  **Set up Firebase (if not already done):**
    *   Create a Firebase project.
    *   Set up Firebase Authentication and Firestore.
    *   Update `src/lib/firebase.ts` with your Firebase configuration.
5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically run on `http://localhost:3000`.
