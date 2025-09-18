This directory is used by Changesets to manage versioning and releases across the monorepo.

Basic flow:

1. Create a changeset when you make user-visible changes:

    pnpm changeset

    - Choose the packages to bump
    - Select the bump type (patch/minor/major)
    - Write a concise summary

2. Commit the generated file under .changeset/\*.md

3. When ready to release:

    pnpm version-packages
    pnpm release

This will version packages, update changelogs, build, and publish with public access.
