# MediConnect: Your Health, Reimagined

MediConnect is a modern, full-stack web application designed to streamline the connection between patients and doctors. It provides a comprehensive platform for finding medical professionals, booking appointments, and managing healthcare-related information securely and efficiently.

![MediConnect Screenshot](https://placehold.co/1200x600.png)
_Note: You can replace the placeholder image above with a screenshot of your application's homepage._

---

## ✨ Features

MediConnect offers a tailored experience for both patients and doctors through dedicated dashboards.

### For Patients
-   **Find a Doctor:** Search and filter a network of verified doctors by name and specialty.
-   **View Doctor Profiles:** Access detailed profiles of doctors, including their specialty, experience, and qualifications.
-   **Book Appointments:** Seamlessly book available time slots with the doctor of your choice.
-   **Simulated Payment Flow:** Experience a realistic (but simulated) payment process for consultation fees.
-   **Manage Appointments:** View upcoming and past appointments, with the option to cancel.
-   **Personal Profile Management:** Update personal information, including contact details and medical history.

### For Doctors
-   **Manage Availability:** Set and update available time slots for patient bookings.
-   **Appointment Dashboard:** View and manage all scheduled appointments. Mark them as "completed" after they have occurred or "cancel" them.
-   **Patient Information:** Access essential patient details and the reason for their visit before an appointment.
-   **View Patient List:** See a comprehensive list of all patients they have consulted.
-   **Professional Profile Management:** Update professional details, including specialty, bio, qualifications, and consultation fee.

---

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable technology stack.

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **UI Library:** [React](https://react.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
-   **AI Integration:** [Google's Genkit](https://firebase.google.com/docs/genkit) (Configured for potential AI features)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/)
-   **Date Management:** [date-fns](https://date-fns.org/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone <repository-url>
cd <project-directory>
```
Replace `<repository-url>` with your project's repository URL.

### 2. Install Dependencies

Install all the required npm packages:

```bash
npm install
```

### 3. Set Up Firebase

This project uses Firebase for authentication and database services. You'll need to create your own Firebase project to run it locally.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App:** Inside your project, create a new Web App. Firebase will provide you with a configuration object.
3.  **Enable Services:**
    *   Go to the **Authentication** section and enable the "Email/Password" sign-in method.
    *   Go to the **Firestore Database** section and create a new database. Start in **test mode** for easy setup (you can secure it later with the provided `firestore.rules`).
4.  **Create Environment File:** Create a file named `.env.local` in the root of your project. Copy your Firebase configuration credentials into this file like so:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    ```
    You can find these values in your Firebase project settings under "Your apps" > "Web app" > "SDK setup and configuration".

### 4. Run the Development Server

Now, you can start the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002` (or another port if 9002 is in use).

---

## 📂 Project Structure

The project follows a standard Next.js App Router structure:

-   `/src/app`: Contains all the application routes, layouts, and pages.
-   `/src/components`: Houses reusable UI components, including ShadCN UI components.
-   `/src/contexts`: Contains React contexts, such as the `AuthContext` for managing user state.
-   `/src/hooks`: Holds custom React hooks, like `useAuth` and `useToast`.
-   `/src/lib`: Includes utility functions and the Firebase configuration (`firebase.ts`).
-   `/src/ai`: Is set up for Genkit AI flows and configurations.
