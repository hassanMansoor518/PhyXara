# PhyXara 📱

**PhyXara** is a React Native mobile application built with **Expo**.

This README explains how to set up the project on a new system and run it locally for development.

---

## 📋 Prerequisites

Before starting, make sure the following are installed:

* **Node.js** — LTS version recommended
* **npm** — Comes with Node.js
* **Git**
* **Expo Go** — If you want to run the app on a physical Android/iOS device

### Check installations

Open a terminal and run:

```bash
node -v
npm -v
git --version
```

If these commands return version numbers, the required tools are installed.

---

# 🚀 Getting Started

## 1. Clone the Repository

Clone the PhyXara repository:

```bash
git clone https://github.com/hassanMansoor518/PhyXara.git
```

Move into the project directory:

```bash
cd PhyXara
```

---

## 2. Go to the Mobile Project

The React Native application is inside the `Mobile` folder:

```bash
cd Mobile
```

Your directory should now look similar to:

```text
PhyXara/
└── Mobile/
    ├── app/
    ├── assets/
    ├── components/
    ├── package.json
    └── ...
```

---

## 3. Install Dependencies

Run:

```bash
npm install
```

This installs all dependencies required by the project.

> You do not need to manually install every package. `npm install` reads the project's `package.json` and installs the required dependencies.

---

# ▶️ Run the Application

Start the Expo development server:

```bash
npx expo start
```

After running this command, Expo will show a QR code in the terminal/browser.

---

# 📱 Run on a Physical Device

## Android

1. Install **Expo Go** on your Android phone.
2. Make sure your phone and computer are connected to the **same Wi-Fi network**.
3. Run:

```bash
npx expo start
```

4. Scan the QR code using Expo Go.

The application should open on your phone.

---

# 💻 Run on Android Emulator

If Android Studio and an Android Emulator are configured:

```bash
npx expo start
```

Then press:

```text
a
```

in the Expo terminal.

Expo will attempt to launch the application in the Android emulator.

---

# 🍎 Run on iOS

If you are using macOS with Xcode installed:

```bash
npx expo start
```

Then press:

```text
i
```

This opens the project in the iOS Simulator.

> iOS Simulator requires macOS and Xcode.

---

# 🌐 Expo Web

If web support is configured for the project, you can run:

```bash
npx expo start --web
```

---

# 📦 Install a New Package

If you need to add a package, use:

```bash
npm install package-name
```

For Expo-compatible packages, prefer:

```bash
npx expo install package-name
```

Example:

```bash
npx expo install expo-camera
```

---

# 🔄 After Pulling New Changes

Whenever a teammate pushes new changes, first pull them:

```bash
git pull origin main
```

Then install any newly added dependencies:

```bash
npm install
```

Finally start the project:

```bash
npx expo start
```

---

# 🧹 If You Face Dependency/Cache Issues

First try:

```bash
npx expo start -c
```

If the problem is related to dependencies, remove `node_modules` and reinstall.

### Windows

```bash
rmdir /s /q node_modules
npm install
```

Then:

```bash
npx expo start -c
```

---

# 🔐 Environment Variables

If the project uses environment variables, create a local environment file as required by the project.

Example:

```text
.env
```

Never commit private API keys, passwords, tokens, or secrets to GitHub.

If environment variables are required, ask the project maintainer for the required values.

---

# 📁 Project Structure

```text
PhyXara/
│
├── Mobile/
│   ├── app/              # Application screens/routes
│   ├── assets/           # Images, icons and other assets
│   ├── components/       # Reusable UI components
│   ├── package.json      # Project dependencies and scripts
│   ├── app.json         # Expo configuration
│   └── ...
│
└── README.md
```

> The exact structure may change as the project develops.

---

# 👥 Team Development

Before starting development:

```bash
git pull origin main
```

Create a separate branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/login-screen
```

After completing your changes:

```bash
git add .
git commit -m "Add login screen"
git push -u origin feature/login-screen
```

Then create a Pull Request on GitHub.

---

# ⚠️ Important Git Rules

### Do NOT commit `node_modules`

`node_modules` should be included in `.gitignore`.

Each developer should run:

```bash
npm install
```

after cloning the project.

### Do NOT run `git init` inside `Mobile`

The main Git repository is:

```text
PhyXara/
```

Do **not** create another Git repository inside:

```text
PhyXara/Mobile/
```

This prevents Git submodule/embedded repository problems.

---

# 🛠️ Common Commands

| Command                   | Purpose                    |
| ------------------------- | -------------------------- |
| `npm install`             | Install dependencies       |
| `npx expo start`          | Start Expo                 |
| `npx expo start -c`       | Start Expo and clear cache |
| `npx expo start --web`    | Run on web                 |
| `git pull origin main`    | Get latest changes         |
| `git status`              | Check Git status           |
| `git add .`               | Stage changes              |
| `git commit -m "message"` | Commit changes             |
| `git push`                | Push changes               |

---

# ✅ Quick Setup

For an experienced teammate, the basic setup is:

```bash
git clone https://github.com/hassanMansoor518/PhyXara.git
cd PhyXara/Mobile
npm install
npx expo start
```

Then scan the QR code with **Expo Go**.

---

# 🤝 Contributing

1. Pull the latest changes.
2. Create a feature branch.
3. Make your changes.
4. Test the application.
5. Commit your changes.
6. Push your branch.
7. Open a Pull Request.

Please keep the code clean, reusable, and consistent with the existing project structure.

---

# 📄 License

This project is currently developed for the PhyXara team.

---

## 💙 PhyXara

Built with **React Native + Expo**.
