# 🍌 Banana Catcher Game

Welcome to **Banana Catcher**, a fun and interactive game where players catch falling bananas while solving math problems! This project is built using **React** and **Firebase**.

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/banana-catcher.git
cd banana-catcher
```

### 2. Install Dependencies
Make sure you have Node.js installed on your system. Then, run the following command to install the required libraries:
```bash
npm install
```

### 3. Start the Application
Run the following command to start the app in development mode:
```bash
npm start
```
This will open the app in your default browser at http://localhost:3000.

---

## 📦 Libraries Used
The following libraries are used in this project:
- **React**: For building the user interface.
- **Firebase**: For authentication and database management.
- **Bootstrap**: For styling and responsive design.
- **Animate.css**: For animations.
- **React Scripts**: For managing the React app lifecycle.

To install these libraries manually, run:
```bash
npm install react firebase bootstrap animate.css react-scripts
```

---

## 🎮 About the Game

### Objective
The goal of the game is to catch falling bananas while solving math problems. Players must move the bucket to catch the correct answer to the displayed math question.

### Features
✅ **Math Challenges**: Solve math problems by catching the correct answer.
✅ **Difficulty Levels**: Choose between Easy, Medium, and Hard modes.
✅ **Leaderboard**: View the top scores for each difficulty level.
✅ **Audio Effects**: Background music and sound effects for correct and incorrect answers.
✅ **Responsive Design**: Works on both desktop and mobile devices.

### How to Play
1. Select a difficulty level from the menu.
2. Use your mouse to move the bucket and catch the falling bananas.
3. Each banana has a number. Catch the banana with the correct answer to the math problem displayed on the screen.
4. Avoid missing bananas or catching the wrong answer, as it will reduce your health.
5. The game ends when your health reaches zero.

---

## 🛠️ Project Structure
```
banana-catcher/
├── public/
│   ├── Banana.ico
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── aud/ (Audio files)
│   │   └── img/ (Image files)
│   ├── Components/
│   │   ├── AudioContext.js
│   │   ├── GameView.js
│   │   ├── Leaderboard.js
│   │   ├── LoginForm.js
│   │   ├── MenuForm.js
│   │   └── RegisterForm.js
│   ├── App.js
│   ├── App.css
│   ├── firebase.js
│   ├── index.js
│   └── index.css
└── package.json
```

---

## 🔧 Firebase Configuration
This project uses Firebase for authentication and database management. To set up Firebase:
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Add a web app to your Firebase project.
3. Replace the `firebaseConfig` object in `src/firebase.js` with your Firebase project credentials.

---

## 🏆 Leaderboard
The leaderboard displays the top scores for each difficulty level. Scores are stored in Firebase Firestore. Players can filter the leaderboard by difficulty.

---

## 🎵 Audio Features
🎶 **Background Music**: Plays continuously during the game.
🔊 **Sound Effects**: Plays when the player catches the correct or incorrect answer.

---

## 🖼️ Assets
🖼 **Images**: Banana, bucket, and other game-related images are stored in the `src/assets/img/` directory.
🎵 **Audio**: Background music and sound effects are stored in the `src/assets/aud/` directory.

---

## 🛡️ Authentication
The game uses **Firebase Authentication** for user registration and login. Players can:
- Register with their email and password.
- Log in to access the game.
- Reset their password if they forget it.

---

## 📝 License
This project is licensed under the **MIT License**. Feel free to use and modify it as needed.

---

## 📧 Contact
For any questions or feedback, feel free to reach out to the project maintainer:
- **Email**: dinillamahewa00@gmail.com
- **GitHub**: [Dinil-lamahewa](https://github.com/Dinil-lamahewa)

