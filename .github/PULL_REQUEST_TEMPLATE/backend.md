## Summary
<!-- Briefly describe what this PR implements or fixes (1–3 lines). -->
<!-- e.g. Added user registration API, fixed database connection issue -->

## Changes
<!-- Summarize what has been changed. No need to list every file. -->
<!-- e.g. Added `/users` endpoint, unified error handling in usecase layer -->

-

## Local Verification
Before creating the PR, please verify the following (exclude items already covered by CI/CD):

**API checks**
- [ ] The implemented API works as expected (tested with curl, Postman, etc.)
- [ ] No impact on existing APIs (main endpoints confirmed)
- [ ] Error responses follow the defined format

**Database checks (if applicable)**
- [ ] Migration files are created and applied correctly
- [ ] Rollback works as expected
- [ ] No data loss or corruption

**Code quality**
- [ ] Unit tests pass locally (`make test`)
- [ ] No linting errors (`make lint`)
- [ ] Code follows Clean Architecture principles

**Note**
> CI/CD automatically runs: staticcheck, and build validation

## API Changes
<!-- If API endpoints are added/modified, describe them here. -->
<!-- e.g. POST /users - Create new user, GET /users/{id} - Get user by ID -->

| Method | Endpoint | Description |
|--------|----------|-------------|
|        |          |             |

## Database Changes
<!-- Describe migration or schema changes if applicable. -->
<!-- e.g. Added `users` table, added `status` column to `robots` table -->

-

## Notes
<!-- Add any additional context for reviewers (background, constraints, TODOs, etc.) -->

-

## Related Issues / PRs
<!-- Link related Issues or PRs if any. -->
<!-- e.g. Closes #123 -->

-
