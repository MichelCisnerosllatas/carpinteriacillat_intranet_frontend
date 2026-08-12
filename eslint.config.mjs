import nextConfig from 'eslint-config-next'

// eslint-config-next@16 ships a native ESLint 9 flat config (Linter.Config[]) — no FlatCompat
// needed anymore. The old `FlatCompat.extends('next/core-web-vitals', 'next/typescript')` setup
// loads the legacy (ESLint 8 style) shareable configs, which under ESLint 9 fail validation and
// crash with "TypeError: Converting circular structure to JSON" while trying to report that
// validation error (a react-plugin self-reference in the legacy config trips up the error
// formatter). Importing the flat config directly avoids the legacy loader entirely.
const eslintConfig = [...nextConfig]

export default eslintConfig
