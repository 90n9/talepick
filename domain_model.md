# Domain Model Specification (Stage 2)

**This document has been split into manageable sections. Please see the [domain_model/](./domain_model/) directory for the complete specification.**

## Quick Navigation

1. [Domain Overview](./domain_model/01_domain_overview.md) - High-level domain concepts
2. [Domain Entities](./domain_model/02_entities.md) - All entities with detailed specifications
3. [Value Objects](./domain_model/03_value_objects.md) - Immutable value objects and validation
4. [Aggregates & Roots](./domain_model/04_aggregates.md) - Consistency boundaries
5. [Domain Relationships](./domain_model/05_relationships.md) - Entity relationships
6. [Business Rules](./domain_model/06_business_rules.md) - All domain rules
7. [Domain Events](./domain_model/07_domain_events.md) - Event-driven architecture
8. [State Machines](./domain_model/08_state_machines.md) - Key flow visualizations
9. [Open Questions](./domain_model/09_open_questions.md) - Clarifications needed
10. [Appendix](./domain_model/10_appendix.md) - Glossary and implementation notes

## Purpose

This domain model serves as the **single source of truth** for:
- Database schema generation (Stage 3)
- API contract design (Stage 4)
- Business logic implementation
- Validation rules across Admin and Frontend
- Consistency guarantees throughout the system

## Key Domain Concepts

TalePick is a Thai-language interactive story platform where users navigate branching narratives through multimedia-enhanced scenes, making strategic choices that consume credits and unlock different story endings.

**Core entities include:**
- **Users & Guests**: Players with credit-based resource management
- **Stories & Scenes**: Interactive content with branching paths
- **Choices**: Decisions that cost credits and affect outcomes
- **Achievements**: Gamification elements unlocking content and avatars
- **Credits**: In-game currency with time-based refills

## Architecture Highlights

- **User Aggregate**: Manages credits, achievements, and progress
- **Story Aggregate**: Ensures narrative structure integrity
- **Session Aggregate**: Handles transient gameplay state
- **Credit Economy**: 5-minute refills, strategic choice costs
- **Achievement System**: Progress tracking with avatar rewards

For complete details, please refer to the individual section files in the [domain_model/](./domain_model/) directory.