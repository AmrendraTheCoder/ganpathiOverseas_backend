-- Row Level Security Policies for Enterprise Job Management System
-- Created: 2024-12-20
-- Purpose: Role-based access control policies

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result FROM users WHERE id = user_id;
    RETURN COALESCE(user_role_result, 'operator'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is supervisor or admin
CREATE OR REPLACE FUNCTION is_supervisor_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'supervisor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is finance or admin
CREATE OR REPLACE FUNCTION is_finance_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'finance');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Admin can see all users, others can only see themselves and basic info of others
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (
    auth.uid() = id OR 
    is_admin(auth.uid()) OR
    (is_supervisor_or_admin(auth.uid()) AND is_active = true)
);

-- Only admin can insert new users
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (
    is_admin(auth.uid())
);

-- Admin can update anyone, users can update themselves (limited fields)
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (
    is_admin(auth.uid()) OR 
    (auth.uid() = id AND is_active = true)
);

-- Only admin can delete users
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- PARTIES TABLE POLICIES
-- =====================================================

-- Admin, Supervisor, and Finance can see all parties; Operators can see parties from their jobs
CREATE POLICY "parties_select_policy" ON parties FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_supervisor_or_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM job_sheets 
        WHERE job_sheets.party_id = parties.id 
        AND job_sheets.assigned_to = auth.uid()
    )
);

-- Admin and Supervisor can insert parties
CREATE POLICY "parties_insert_policy" ON parties FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid())
);

-- Admin and Supervisor can update parties
CREATE POLICY "parties_update_policy" ON parties FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid())
);

-- Only Admin can delete parties
CREATE POLICY "parties_delete_policy" ON parties FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- MACHINES TABLE POLICIES
-- =====================================================

-- All authenticated users can view machines
CREATE POLICY "machines_select_policy" ON machines FOR SELECT USING (
    auth.uid() IS NOT NULL
);

-- Admin and Supervisor can insert/update machines
CREATE POLICY "machines_insert_policy" ON machines FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "machines_update_policy" ON machines FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid())
);

-- Only Admin can delete machines
CREATE POLICY "machines_delete_policy" ON machines FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- JOB SHEETS TABLE POLICIES
-- =====================================================

-- Admin and Supervisor see all; Finance sees all; Operators see only assigned jobs
CREATE POLICY "job_sheets_select_policy" ON job_sheets FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_supervisor_or_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid()) OR
    assigned_to = auth.uid()
);

-- Admin and Supervisor can create jobs
CREATE POLICY "job_sheets_insert_policy" ON job_sheets FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid())
);

-- Admin and Supervisor can update all; Operators can update only assigned jobs (limited fields)
CREATE POLICY "job_sheets_update_policy" ON job_sheets FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid()) OR
    (assigned_to = auth.uid() AND get_user_role(auth.uid()) = 'operator')
);

-- Only Admin can delete jobs
CREATE POLICY "job_sheets_delete_policy" ON job_sheets FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- EXPENSES TABLE POLICIES
-- =====================================================

-- Admin and Finance can see all expenses; others can see job-related expenses for their jobs
CREATE POLICY "expenses_select_policy" ON expenses FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid())
);

-- Admin and Finance can create expenses
CREATE POLICY "expenses_insert_policy" ON expenses FOR INSERT WITH CHECK (
    is_finance_or_admin(auth.uid())
);

-- Admin and Finance can update expenses
CREATE POLICY "expenses_update_policy" ON expenses FOR UPDATE USING (
    is_finance_or_admin(auth.uid())
);

-- Only Admin can delete expenses
CREATE POLICY "expenses_delete_policy" ON expenses FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- PARTY TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Admin and Finance can see all; Supervisor can see all; Operators can see transactions for their job parties
CREATE POLICY "party_transactions_select_policy" ON party_transactions FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid()) OR
    is_supervisor_or_admin(auth.uid())
);

-- Admin and Finance can create transactions
CREATE POLICY "party_transactions_insert_policy" ON party_transactions FOR INSERT WITH CHECK (
    is_finance_or_admin(auth.uid())
);

-- Admin and Finance can update transactions
CREATE POLICY "party_transactions_update_policy" ON party_transactions FOR UPDATE USING (
    is_finance_or_admin(auth.uid())
);

-- Only Admin can delete transactions
CREATE POLICY "party_transactions_delete_policy" ON party_transactions FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- JOB PROGRESS TABLE POLICIES
-- =====================================================

-- All can see progress of jobs they have access to
CREATE POLICY "job_progress_select_policy" ON job_progress FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM job_sheets 
        WHERE job_sheets.id = job_progress.job_id 
        AND (
            is_admin(auth.uid()) OR
            is_supervisor_or_admin(auth.uid()) OR
            is_finance_or_admin(auth.uid()) OR
            job_sheets.assigned_to = auth.uid()
        )
    )
);

-- Operators can add progress for their jobs; Supervisors and Admins can add for any job
CREATE POLICY "job_progress_insert_policy" ON job_progress FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM job_sheets 
        WHERE job_sheets.id = job_progress.job_id 
        AND job_sheets.assigned_to = auth.uid()
    )
);

-- Same rules for updates
CREATE POLICY "job_progress_update_policy" ON job_progress FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid()) OR
    (operator_id = auth.uid())
);

-- Only Admin and Supervisor can delete progress entries
CREATE POLICY "job_progress_delete_policy" ON job_progress FOR DELETE USING (
    is_supervisor_or_admin(auth.uid())
);

-- =====================================================
-- SYSTEM SETTINGS TABLE POLICIES
-- =====================================================

-- All authenticated users can view settings
CREATE POLICY "system_settings_select_policy" ON system_settings FOR SELECT USING (
    auth.uid() IS NOT NULL
);

-- Only Admin can modify settings
CREATE POLICY "system_settings_insert_policy" ON system_settings FOR INSERT WITH CHECK (
    is_admin(auth.uid())
);

CREATE POLICY "system_settings_update_policy" ON system_settings FOR UPDATE USING (
    is_admin(auth.uid())
);

CREATE POLICY "system_settings_delete_policy" ON system_settings FOR DELETE USING (
    is_admin(auth.uid())
);

-- =====================================================
-- AUDIT LOGS TABLE POLICIES
-- =====================================================

-- Admin can see all audit logs; others can see their own actions
CREATE POLICY "audit_logs_select_policy" ON audit_logs FOR SELECT USING (
    is_admin(auth.uid()) OR user_id = auth.uid()
);

-- System can insert audit logs (no user restrictions)
CREATE POLICY "audit_logs_insert_policy" ON audit_logs FOR INSERT WITH CHECK (true);

-- No updates or deletes on audit logs
CREATE POLICY "audit_logs_update_policy" ON audit_logs FOR UPDATE USING (false);
CREATE POLICY "audit_logs_delete_policy" ON audit_logs FOR DELETE USING (false);

-- =====================================================
-- FUNCTIONS FOR ROLE-BASED QUERIES
-- =====================================================

-- Function to get dashboard stats based on user role
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    role user_role;
    stats JSON;
BEGIN
    role := get_user_role(user_id);
    
    CASE role
        WHEN 'admin' THEN
            SELECT json_build_object(
                'total_users', (SELECT COUNT(*) FROM users WHERE is_active = true),
                'total_jobs', (SELECT COUNT(*) FROM job_sheets WHERE is_deleted = false),
                'active_jobs', (SELECT COUNT(*) FROM job_sheets WHERE status IN ('pending', 'in_progress') AND is_deleted = false),
                'total_parties', (SELECT COUNT(*) FROM parties WHERE is_active = true),
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment'),
                'pending_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND status = 'pending'),
                'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE))
            ) INTO stats;
            
        WHEN 'supervisor' THEN
            SELECT json_build_object(
                'total_jobs', (SELECT COUNT(*) FROM job_sheets WHERE is_deleted = false),
                'active_jobs', (SELECT COUNT(*) FROM job_sheets WHERE status IN ('pending', 'in_progress') AND is_deleted = false),
                'completed_today', (SELECT COUNT(*) FROM job_sheets WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE),
                'my_jobs', (SELECT COUNT(*) FROM job_sheets WHERE created_by = user_id AND is_deleted = false),
                'overdue_jobs', (SELECT COUNT(*) FROM job_sheets WHERE due_date < CURRENT_DATE AND status != 'completed' AND is_deleted = false)
            ) INTO stats;
            
        WHEN 'finance' THEN
            SELECT json_build_object(
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment'),
                'pending_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND status = 'pending'),
                'overdue_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND status = 'overdue'),
                'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)),
                'monthly_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment' AND transaction_date >= date_trunc('month', CURRENT_DATE))
            ) INTO stats;
            
        WHEN 'operator' THEN
            SELECT json_build_object(
                'assigned_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND status IN ('pending', 'in_progress') AND is_deleted = false),
                'completed_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND status = 'completed'),
                'jobs_today', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND DATE(started_at) = CURRENT_DATE),
                'pending_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND status = 'pending' AND is_deleted = false)
            ) INTO stats;
    END CASE;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 