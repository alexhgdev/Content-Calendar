# TikTok Content Calendar Generator

A web application that generates a 4-week TikTok content calendar based on your brand description, tone, and posting frequency.

## Features

- Generate personalized TikTok content ideas using OpenAI's GPT-4
- Customize based on your brand description, tone, and posting frequency
- View a clean, organized calendar layout
- Copy individual posts or the entire calendar
- Export calendar as CSV for use in other tools

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd content-calendar-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter your brand description in the form
2. Select the desired tone for your content
3. Choose your posting frequency per week
4. Click "Generate Content Calendar"
5. View your personalized content calendar
6. Copy individual posts or the entire calendar
7. Export as CSV if needed

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI API
- React Hot Toast

## License

This project is licensed under the MIT License.
