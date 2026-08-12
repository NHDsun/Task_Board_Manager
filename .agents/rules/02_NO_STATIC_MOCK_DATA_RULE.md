# REPOSITORY RULE: NO STATIC MOCK DATA IN FRONTEND OR CODE

## Strict Rule Definition:
1. **Never Hardcode Mock Static Datasets in Frontend/Backend Files**:
   - Do NOT create inline mock arrays or hardcoded static object sets inside React components or NestJS services.

2. **All Mock Datasets MUST be Managed via Database Seeding**:
   - All sample users, projects, tasks, departments, task requests, attendance logs, and badges MUST be defined in `be/prisma/seed.ts` and populated directly into PostgreSQL via Prisma ORM.

3. **Frontend components MUST fetch real data via API/Stores**:
   - Frontend pages and components must read data from Backend REST APIs / Zustand Auth Store instead of local mock variables.
