# React Todo Application with IndexedDB and Virtual Scroll

This is a Todo application built with React and TypeScript, designed to efficiently manage a large list of tasks, supporting thousands of items. The application utilizes IndexedDB for storing data and implements virtualization to ensure smooth performance even with a large number of tasks.

## Features

- **Efficient Task Management**: Users can add new tasks to the list, mark tasks as completed or incomplete by toggling checkboxes.
- **IndexedDB Storage**: Utilizes IndexedDB for efficient storage of tasks, enabling support for large datasets without significant performance impact. Localstorage wasn't the best option due to size limits.
- **Virtualization**: Rendering only what is visible. Implemented virtual scroll(virtualization) to remove lag and display only the required elements, ensuring smooth performance.

## Installation and Setup

To run the application locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/AmeyaJain-25/indexed-db-todo-app.git
   ```

2. Navigate to the project directory:

   ```
   cd indexed-db-todo-app
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Start the development server:

   ```
   npm start
   ```

5. Open your web browser and navigate to `http://localhost:3000` to view the application.

## Contributions

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.
