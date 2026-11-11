# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Learning backend

Use Node 24 and a PostgreSQL database. Copy the learning API settings from
`.env.example` into `.env`. Set `DATABASE_URL` to the database connection
string and `CLERK_ISSUER` to the HTTPS issuer for the same Clerk instance as
the app's publishable key. The API initializes its tables and seeds the
catalog on its first database request. The database role needs permission
to create those tables.

From this directory, run `npm run server` and `npm start` in separate terminals.
Check `/api/v1/health` for database readiness. On a physical device, use the
computer's LAN IP in `EXPO_PUBLIC_LEARNING_API_URL` and restart Expo after
editing the environment. For a hosted app, use the API's HTTPS origin and
configure database backups with the database provider.

Learning activity queues locally by Clerk account and retries when a
learning screen gains focus. Previous device-only totals were unowned and
included demo values, so they are excluded from cloud progress. The reminder
setting saves a preference for the account.

Chapter completion and bookmarks are saved on the device per account. Chapter
completion also syncs to the backend when it is reachable. The server can
infer its Clerk issuer from the publishable key when CLERK_ISSUER is omitted.

The Class 9 practical catalog is available at /api/v1/practicals. Each
practical has detail, quiz, and model routes. Signed-in clients use
/api/v1/practicals/:number/state and /events for progress, bookmarks, and
server-scored quiz attempts. The learning database initialization creates
the practical_events table. The device stores pending events while offline.

Camera AR uses the existing Unity development build and is available for
the registered Vernier and micrometer models on supported devices. All
16 practicals include an interactive in-app 3D apparatus view.

Set EXPO_PUBLIC_PRACTICAL_MANUAL_URL to a hosted copy of the manual to
enable PDF page links in the app. The book's page references are visible
without this setting.
