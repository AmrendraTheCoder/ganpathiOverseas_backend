# SQL Files Organization

This directory contains all SQL files organized by their purpose and functionality.

## Directory Structure

### 📁 `database-setup/`

Complete database setup and configuration files:

- `database_setup.sql` - Original database setup
- `database_setup_fixed.sql` - Fixed version of database setup
- `final_database_setup.sql` - Final complete database setup
- `complete_database_setup.sql` - Complete database schema
- `compatible_database_setup.sql` - Compatible database setup
- `compatible_database_setup_fixed.sql` - Fixed compatible setup
- `complete_final_migration.sql` - Final migration script
- `database_migration_fixed.sql` - Fixed migration script

### 📁 `demo-data/`

Sample and demo data insertion files:

- `add-sample-jobs.sql` - Original sample jobs
- `add-sample-jobs-minimal.sql` - Minimal sample jobs
- `add-sample-jobs-corrected.sql` - Corrected sample jobs
- `add-sample-jobs-fixed.sql` - Fixed sample jobs
- `add-more-demo-jobs.sql` - Additional demo jobs

### 📁 `schema-checks/`

Database validation and analysis files:

- `check-table-structure.sql` - Table structure validation
- `check-job-sheets-schema.sql` - Job sheets schema check
- `check-database.sql` - General database check
- `database-check.sql` - Database validation
- `supabase-check.sql` - Supabase connection check
- `database_analysis.sql` - Database analysis queries

### 📁 `operator-setup/`

Operator-specific setup and configuration:

- `operator_setup.sql` - Original operator setup
- `operator_setup_fixed.sql` - Fixed operator setup
- `operator_setup_compatible.sql` - Compatible operator setup
- `operator_setup_final.sql` - Final operator setup
- `operator_setup_minimal.sql` - Minimal operator setup
- `operator_setup_simple.sql` - Simple operator setup
- `operator_setup_final_working.sql` - Final working operator setup

### 📁 `deployment/`

Production deployment and remote setup files:

- `deploy-to-supabase.sql` - Supabase deployment script
- `supabase_remote_setup.sql` - Remote Supabase setup
- `quick-setup.sql` - Quick setup script
- `quick-setup-fixed.sql` - Fixed quick setup
- `quick-setup-final.sql` - Final quick setup

### 📁 `migration/`

Schema migration and updates:

- `create-time-logs-table.sql` - Time logs table creation
- `add-time-logs-table.sql` - Add time logs table
- `update-job-sheets-schema.sql` - Job sheets schema updates

## Usage Guidelines

1. **For new installations**: Start with files in `database-setup/`
2. **For adding demo data**: Use files in `demo-data/`
3. **For operator features**: Use files in `operator-setup/`
4. **For production deployment**: Use files in `deployment/`
5. **For schema changes**: Use files in `migration/`
6. **For troubleshooting**: Use files in `schema-checks/`

## Recommended Execution Order

1. Database Setup: `database-setup/final_database_setup.sql`
2. Operator Setup: `operator-setup/operator_setup_final_working.sql`
3. Demo Data: `demo-data/add-sample-jobs-fixed.sql`
4. Validation: `schema-checks/check-database.sql`
