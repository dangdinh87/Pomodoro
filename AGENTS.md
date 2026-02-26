# AI DevKit Rules

## Project Context
This project uses ai-devkit for structured AI-assisted development. Phase documentation is located in `docs/ai/`.

## Documentation Structure
- `docs/ai/requirements/` - Problem understanding and requirements
- `docs/ai/design/` - System architecture and design decisions (include mermaid diagrams)
- `docs/ai/planning/` - Task breakdown and project planning
- `docs/ai/implementation/` - Implementation guides and notes
- `docs/ai/testing/` - Testing strategy and test cases
- `docs/ai/deployment/` - Deployment and infrastructure docs
- `docs/ai/monitoring/` - Monitoring and observability setup

## Code Style & Standards
- Follow the project's established code style and conventions
- Write clear, self-documenting code with meaningful variable names
- Add comments for complex logic or non-obvious decisions

## Development Workflow
- Review phase documentation in `docs/ai/` before implementing features
- Keep requirements, design, and implementation docs updated as the project evolves
- Reference the planning doc for task breakdown and priorities
- Copy the testing template (`docs/ai/testing/README.md`) before creating feature-specific testing docs

## AI Interaction Guidelines
- When implementing features, first check relevant phase documentation
- For new features, start with requirements clarification
- Update phase docs when significant changes or decisions are made

## Skills (Extend Your Capabilities)
Skills are packaged capabilities that teach you new competencies, patterns, and best practices. Check for installed skills in the project's skill directory and use them to enhance your work.

### Using Installed Skills
1. **Check for skills**: Look for `SKILL.md` files in the project's skill directory
2. **Read skill instructions**: Each skill contains detailed guidance on when and how to use it
3. **Apply skill knowledge**: Follow the patterns, commands, and best practices defined in the skill

### Key Installed Skills
- **memory**: Use AI DevKit's memory service via CLI commands when MCP is unavailable. Read the skill for detailed `memory store` and `memory search` command usage.

### When to Reference Skills
- Before implementing features that match a skill's domain
- When MCP tools are unavailable but skill provides CLI alternatives
- To follow established patterns and conventions defined in skills

## Knowledge Memory (Always Use When Helpful)
The AI assistant should proactively use knowledge memory throughout all interactions.

> **Tip**: If MCP is unavailable, use the **memory skill** for detailed CLI command reference.

### When to Search Memory
- Before starting any task, search for relevant project conventions, patterns, or decisions
- When you need clarification on how something was done before
- To check for existing solutions to similar problems
- To understand project-specific terminology or standards

**How to search**:
- Use `memory.searchKnowledge` MCP tool with relevant keywords, tags, and scope
- If MCP tools are unavailable, use `npx ai-devkit memory search` CLI command (see memory skill for details)
- Example: Search for "authentication patterns" when implementing auth features

### When to Store Memory
- After making important architectural or design decisions
- When discovering useful patterns or solutions worth reusing
- If the user explicitly asks to "remember this" or save guidance
- When you establish new conventions or standards for the project

**How to store**:
- Use `memory.storeKnowledge` MCP tool
- If MCP tools are unavailable, use `npx ai-devkit memory store` CLI command (see memory skill for details)
- Include clear title, detailed content, relevant tags, and appropriate scope
- Make knowledge specific and actionable, not generic advice

### Memory Best Practices
- **Be Proactive**: Search memory before asking the user repetitive questions
- **Be Specific**: Store knowledge that's actionable and reusable
- **Use Tags**: Tag knowledge appropriately for easy discovery (e.g., "api", "testing", "architecture")
- **Scope Appropriately**: Use `global` for general patterns, `project:<name>` for project-specific knowledge

## Testing & Quality
- Write tests alongside implementation
- Follow the testing strategy defined in `docs/ai/testing/`
- Use `/writing-test` to generate unit and integration tests targeting 100% coverage
- Ensure code passes all tests before considering it complete

## Documentation
- Update phase documentation when requirements or design changes
- Keep inline code comments focused and relevant
- Document architectural decisions and their rationale
- Use mermaid diagrams for any architectural or data-flow visuals (update existing diagrams if needed)
- Record test coverage results and outstanding gaps in `docs/ai/testing/`

## Key Commands
When working on this project, you can run commands to:
- Understand project requirements and goals (`review-requirements`)
- Review architectural decisions (`review-design`)
- Plan and execute tasks (`execute-plan`)
- Verify implementation against design (`check-implementation`)
- Writing tests (`writing-test`)
- Perform structured code reviews (`code-review`)

## Cursor Cloud specific instructions

### Application overview
Study Bro is a single Next.js 14 application (Pomodoro timer + productivity suite). It uses pnpm as the package manager and Supabase as the hosted backend (auth + PostgreSQL). There are no Docker containers, microservices, or local databases to run.

### Running the dev server
- `pnpm dev` starts the Next.js dev server on port 3000.
- The landing page (`/`) loads without Supabase credentials; the timer page (`/timer`) also renders but auth-dependent features (task linking, history sync) require valid Supabase credentials.
- The middleware matcher only applies to auth-related routes (`/login`, `/signup`, `/timer/*`, `/tasks/*`, etc.), so public routes are unaffected by missing Supabase config.

### Key commands
See `package.json` scripts. Summary: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm type-check`.

### Environment variables
A `.env.local` file is needed with at minimum `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. See `.env.example` for all available variables. The AI chat feature requires `MEGALLM_API_KEY`.

### Gotchas
- `next.config.js` sets `ignoreBuildErrors: true` for both TypeScript and ESLint, so `pnpm build` succeeds even with pre-existing lint/type errors.
- There are 2 pre-existing ESLint errors in `src/components/focus/focus-mode.tsx` (unescaped entities) that cause `pnpm lint` to exit with code 1.
- `pnpm install` may show a warning about ignored build scripts for `@tsparticles/engine`; this is expected due to `pnpm.onlyBuiltDependencies` only allowing `sharp`.
- The `prebuild` script runs `node scripts/optimize-backgrounds.mjs` which requires `sharp`; this runs automatically before `pnpm build`.
