# Job Tracker

A simple React + TypeScript application to track job applications while rebuilding my programming skills.

This project was built as part of my programming comeback journey. The goal was to practice modern frontend development concepts by creating a real, useful, and progressively improved application.

## Live Demo

[View the live app](https://job-tracker-gray-mu.vercel.app)

## Features

- Add job applications with:
  - Company
  - Position
  - Status
  - Date applied
  - Job posting link
  - Notes

- Track applications by status:
  - Applied
  - Interview
  - Rejected
  - Offer
  - Saved

- Filter applications by status
- Search applications by company or position
- Clear the search input quickly
- Open saved job posting links in a new tab
- Delete individual applications
- Clear all applications with confirmation
- Save applications in the browser using `localStorage`
- Responsive layout for desktop and mobile
- Code organized into reusable components

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- localStorage
- Git / GitHub

## What I Practiced

This project helped me review and practice:

- React components
- Component props
- `useState`
- `useEffect`
- Controlled inputs
- Form handling
- TypeScript types
- Type-only imports
- Rendering lists with `map`
- Filtering arrays with `filter`
- Conditional rendering
- Persisting data with `localStorage`
- Responsive design basics
- CSS styling and UI polish
- Refactoring code into smaller components
- Git workflow: add, commit, and push
- Building a production version with Vite

## Project Structure

```txt
src/
  components/
    ApplicationCard.tsx
    ApplicationForm.tsx
    FilterControls.tsx
  App.tsx
  App.css
  main.tsx
  types.ts
```

## Components

### `ApplicationForm.tsx`

Handles the form inputs, creates a new job application object, and sends it back to `App.tsx`.

### `ApplicationCard.tsx`

Displays a single job application, including its company, position, status, date applied, job link, notes, and delete button.

### `FilterControls.tsx`

Displays the search input, clear search button, and status filter.

### `types.ts`

Stores shared TypeScript types used across the app.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/NachoColazo/job-tracker.git
```

Go into the project folder:

```bash
cd job-tracker
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the project for production:

```bash
npm run build
```

## Data Persistence

This app uses `localStorage` to save job applications in the browser.

That means applications stay saved after refreshing the page, but the data is stored only in the current browser and device.

## Current Status

The app is functional and includes application creation, persistent storage, filtering, search, responsive styling, and component-based organization.
