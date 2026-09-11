# Fahad Dashboard

A personal multi-page dashboard built with React and Vite. It combines seven focused pages into one site for academic tracking, personal planning, expenses, movies, job preparation, books, and university applications.

## Pages

- `Academic`: Track terms, courses, CGPA, class tests, and tasks.
- `My Plan`: Manage goals with weekly, monthly, and yearly analysis.
- `Expenses`: Track spending, future purchases, and expense trends.
- `Movies`: Save watched titles, ratings, watch dates, and yearly summaries.
- `Job Prep`: Track applications, skills, and learning resources.
- `Books`: Maintain a reading list and a buy list.
- `University`: Organize masters and PhD targets, requirements, deadlines, and notes.

## Stack

- `React`
- `Vite`
- `React Router`
- `localStorage` for client-side persistence

## Project Structure

```text
src/
  App.jsx
  main.jsx
  styles.css
  hooks/
    useLocalStorage.js
  pages/
    Academic.jsx
    Books.jsx
    Expenses.jsx
    JobPrep.jsx
    Movies.jsx
    MyPlan.jsx
    University.jsx
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Notes

- Data is stored in the browser with `localStorage`, so each device or browser keeps its own saved entries.
- The `Movies` page uses the OMDb API with the `trilogy` API key currently included in the component.
- `node_modules/` and `dist/` should not be committed if you add a `.gitignore`.

## Suggested `.gitignore`

```gitignore
node_modules
dist
```
