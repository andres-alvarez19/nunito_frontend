# Project Overview

This is a web application for educational mini-games designed for children aged 6-9 as part of the School Integration Program (PIE). The goal is to reinforce phonological awareness through interactive mini-games, with real-time teacher supervision.

The application is built with [Next.js](https://nextjs.org/) and [React](https://react.dev/). The UI is built with [Shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/).

The main application logic is in `app/page.tsx`, which acts as a state machine, rendering different components based on the application state. The application supports two main user roles: "teacher" and "student".

## Building and Running

### Prerequisites

*   Node.js (v18 or higher)
*   pnpm

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    pnpm install
    ```

### Running the application

To run the application in development mode:

```bash
pnpm run dev
```

This will start the application on [http://localhost:3000](http://localhost:3000).

### Building the application

To build the application for production:

```bash
pnpm run build
```

This will create an optimized build in the `.next` directory.

### Starting the application in production

To start the application in production mode:

```bash
pnpm run start
```

## Development Conventions

*   **UI Components**: The project uses [Shadcn UI](https://ui.shadcn.com/) for UI components. These are located in the `components/ui` directory.
*   **Game Components**: The mini-games are located in the `components/games` directory.
*   **State Management**: The main application state is managed in `app/page.tsx` using the `useState` hook.
*   **Styling**: The project uses [Tailwind CSS](https://tailwindcss.com/) for styling. Global styles are in `app/globals.css`.
*   **Linting**: The project uses [ESLint](https://eslint.org/) for linting. The configuration is in `.eslintrc.json`.
*   **TypeScript**: The project is written in [TypeScript](https://www.typescriptlang.org/). The configuration is in `tsconfig.json`.
