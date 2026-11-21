Step 1 — Confirm branch
git branch --show-current
git status


Expected branch:
feature/Mobile


Step 2 — Restore latest changes
Hum stash@{0} ko apply karenge, pop nahi. Isse backup stash mein bhi safe rahega.

PowerShell mein run karein:
git stash apply "stash@{0}"


Step 3 — Check restored files
git status


Aapke latest changes, jaise:
- Mobile/app/index.tsx
- Mobile/app/practical.tsx
- Mobile/src/components/onboarding/
- Mobile/src/unity/openPracticalAR.ts
- AR mode class 9/Assets/Resources/VuforiaConfiguration.asset
restore hone chahiye.
Step 4 — Abhi commit mat karein
Mujhe git stash apply aur git status ka complete output bhejein.

Agar conflicts aaye, hum resolve karenge. Agar sab successfully restore ho gaya, phir:
git add -A
git commit -m "Update Mobile onboarding and Unity AR integration"
git push