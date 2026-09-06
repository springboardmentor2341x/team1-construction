--
-- PostgreSQL database dump
--

\restrict W7Np43lsBXe7eQ6zPL4X0HAkCt5kOuYjv4hAer2kuz9PVb5e9f8WM44l1tWRo3l

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actual_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actual_expenses (
    id character varying(36) NOT NULL,
    expense_code character varying(50) NOT NULL,
    project_id character varying(36) NOT NULL,
    category character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text NOT NULL,
    expense_date character varying(20) NOT NULL,
    source_reference character varying(150),
    worker_id character varying(36),
    material_id character varying(36),
    equipment_id character varying(36),
    purchase_order_id character varying(36),
    created_by character varying(36),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.actual_expenses OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: assigned_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assigned_tasks (
    id character varying(36) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    project character varying(150) NOT NULL,
    assigned_to character varying(100) NOT NULL,
    priority character varying(20) NOT NULL,
    status character varying(30) NOT NULL,
    due_date character varying(20) NOT NULL,
    location character varying(150),
    created_at timestamp with time zone NOT NULL,
    project_id character varying(36),
    assigned_to_id character varying(36),
    milestone_id character varying(36),
    contractor_id character varying(36),
    worker_id character varying(36)
);


ALTER TABLE public.assigned_tasks OWNER TO postgres;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id character varying(36) NOT NULL,
    worker_id character varying(36),
    user_id character varying(36),
    user_name character varying(100) NOT NULL,
    project_id character varying(36),
    shift_id character varying(36),
    date character varying(20) NOT NULL,
    day_name character varying(20) NOT NULL,
    shift_type character varying(20) NOT NULL,
    check_in character varying(10),
    check_out character varying(10),
    status character varying(20) NOT NULL,
    hours_worked double precision NOT NULL,
    overtime_hours double precision NOT NULL,
    remarks text,
    location character varying(150),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: budget_category_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_category_allocations (
    id character varying(36) NOT NULL,
    budget_id character varying(36) NOT NULL,
    category character varying(50) NOT NULL,
    allocated_amount numeric(15,2) NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.budget_category_allocations OWNER TO postgres;

--
-- Name: contractor_workers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contractor_workers (
    id character varying(36) NOT NULL,
    contractor_id character varying(36) NOT NULL,
    worker_id character varying(36) NOT NULL,
    project_id character varying(36),
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.contractor_workers OWNER TO postgres;

--
-- Name: cost_estimates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cost_estimates (
    id character varying(36) NOT NULL,
    estimate_code character varying(50) NOT NULL,
    project_id character varying(36) NOT NULL,
    category character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text NOT NULL,
    task_reference character varying(150),
    created_by character varying(36),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.cost_estimates OWNER TO postgres;

--
-- Name: daily_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_activity_logs (
    id character varying(36) NOT NULL,
    date character varying(20) NOT NULL,
    location character varying(150) NOT NULL,
    activity text NOT NULL,
    progress_notes text,
    weather_condition character varying(50) NOT NULL,
    workers_present integer NOT NULL,
    issues text,
    submitted_by character varying(100) NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.daily_activity_logs OWNER TO postgres;

--
-- Name: daily_progress_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_progress_reports (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    report_date character varying(20) NOT NULL,
    progress_category character varying(50) NOT NULL,
    work_completed text NOT NULL,
    progress_percentage integer NOT NULL,
    contractor character varying(150),
    worker_attendance character varying(255),
    worker_count integer NOT NULL,
    worker_absent integer NOT NULL,
    worker_hours double precision NOT NULL,
    machinery_used text,
    materials_consumed text,
    material_updates json,
    cost_incurred double precision NOT NULL,
    weather_conditions character varying(50) NOT NULL,
    safety_observations text,
    quality_inspection_remarks text,
    delays boolean NOT NULL,
    delay_reasons text,
    comments text,
    reported_by character varying(100) NOT NULL,
    reported_by_id character varying(36),
    status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.daily_progress_reports OWNER TO postgres;

--
-- Name: delay_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delay_tracking (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    reason text NOT NULL,
    duration_days integer NOT NULL,
    affected_work_category character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    severity character varying(20) NOT NULL,
    mitigation text,
    impact_on_timeline text,
    reported_date character varying(20) NOT NULL,
    reported_by character varying(100) NOT NULL,
    remarks text,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.delay_tracking OWNER TO postgres;

--
-- Name: equipment_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_status (
    id character varying(36) NOT NULL,
    name character varying(150) NOT NULL,
    type character varying(100) NOT NULL,
    serial_no character varying(100) NOT NULL,
    location character varying(150) NOT NULL,
    operator character varying(100) NOT NULL,
    status character varying(50) NOT NULL,
    last_inspection character varying(20) NOT NULL,
    next_service character varying(20) NOT NULL,
    fuel_level integer,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.equipment_status OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id character varying(36) NOT NULL,
    invoice_id character varying(50) NOT NULL,
    invoice_number character varying(100) NOT NULL,
    vendor_id character varying(36) NOT NULL,
    purchase_order_id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    invoice_date character varying(20) NOT NULL,
    due_date character varying(20) NOT NULL,
    invoice_amount double precision NOT NULL,
    payment_status character varying(30) NOT NULL,
    invoice_status character varying(30) NOT NULL,
    remarks text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: material_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_allocations (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    material_id character varying(36) NOT NULL,
    quantity double precision NOT NULL,
    consumed_quantity double precision NOT NULL,
    allocation_date character varying(20) NOT NULL,
    work_activity character varying(150) NOT NULL,
    responsible_user_id character varying(36),
    responsible_user_name character varying(150) NOT NULL,
    request_id character varying(36),
    remarks text,
    status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.material_allocations OWNER TO postgres;

--
-- Name: material_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_categories (
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.material_categories OWNER TO postgres;

--
-- Name: material_inventories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_inventories (
    id character varying(36) NOT NULL,
    material_id character varying(36) NOT NULL,
    warehouse_location character varying(150) NOT NULL,
    total_stock double precision NOT NULL,
    allocated_stock double precision NOT NULL,
    consumed_stock double precision NOT NULL,
    available_stock double precision NOT NULL,
    min_stock_level double precision NOT NULL,
    status character varying(30) NOT NULL,
    last_updated timestamp with time zone NOT NULL
);


ALTER TABLE public.material_inventories OWNER TO postgres;

--
-- Name: material_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_requests (
    id character varying(36) NOT NULL,
    request_code character varying(50) NOT NULL,
    project_id character varying(36) NOT NULL,
    material_id character varying(36) NOT NULL,
    material_name character varying(150) NOT NULL,
    category_name character varying(100) NOT NULL,
    unit character varying(50) NOT NULL,
    required_quantity double precision NOT NULL,
    required_date character varying(20) NOT NULL,
    work_activity character varying(150) NOT NULL,
    remarks text,
    requested_by_id character varying(36),
    requested_by_name character varying(150) NOT NULL,
    request_date character varying(20) NOT NULL,
    status character varying(30) NOT NULL,
    review_remarks text,
    reviewed_by_id character varying(36),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.material_requests OWNER TO postgres;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id character varying(36) NOT NULL,
    material_code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    category_id character varying(36),
    category_name character varying(100) NOT NULL,
    unit_of_measure character varying(50) NOT NULL,
    unit_price double precision NOT NULL,
    min_stock_level double precision NOT NULL,
    description text,
    status character varying(30) NOT NULL,
    created_by character varying(100),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    project_id character varying(36),
    title character varying(200) NOT NULL,
    message text,
    type character varying(50) NOT NULL,
    notification_type character varying(50),
    category character varying(50),
    "time" character varying(30),
    reference_module character varying(50),
    reference_id character varying(36),
    is_read boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: procurement_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procurement_categories (
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.procurement_categories OWNER TO postgres;

--
-- Name: procurement_request_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procurement_request_items (
    id character varying(36) NOT NULL,
    procurement_request_id character varying(36) NOT NULL,
    material_id character varying(36),
    item_description character varying(200) NOT NULL,
    category_name character varying(100) NOT NULL,
    required_quantity double precision NOT NULL,
    available_stock double precision NOT NULL,
    net_procurement_quantity double precision NOT NULL,
    unit character varying(50) NOT NULL,
    required_date character varying(20) NOT NULL,
    remarks text
);


ALTER TABLE public.procurement_request_items OWNER TO postgres;

--
-- Name: procurement_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procurement_requests (
    id character varying(36) NOT NULL,
    request_id character varying(50) NOT NULL,
    project_id character varying(36) NOT NULL,
    category_name character varying(100) NOT NULL,
    purpose text,
    priority character varying(20) NOT NULL,
    request_date character varying(20) NOT NULL,
    request_status character varying(30) NOT NULL,
    remarks text,
    requested_by_id character varying(36),
    requested_by_name character varying(150) NOT NULL,
    approved_by_id character varying(36),
    approved_by_name character varying(150),
    approved_at timestamp with time zone,
    rejected_by_id character varying(36),
    rejected_by_name character varying(150),
    rejected_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.procurement_requests OWNER TO postgres;

--
-- Name: procurements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procurements (
    id character varying(36) NOT NULL,
    title character varying(150) NOT NULL,
    supplier character varying(150),
    material_name character varying(150),
    expected_delivery_date character varying(30),
    po_number character varying(50),
    amount double precision NOT NULL,
    project_id character varying(36),
    material_id character varying(36),
    quantity double precision NOT NULL,
    status character varying(50) NOT NULL,
    requested_by character varying(100),
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.procurements OWNER TO postgres;

--
-- Name: progress_photographs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progress_photographs (
    id character varying(36) NOT NULL,
    report_id character varying(36) NOT NULL,
    photo_url character varying(500) NOT NULL,
    caption character varying(200),
    uploaded_by character varying(100) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.progress_photographs OWNER TO postgres;

--
-- Name: project_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_audit_logs (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    action character varying(100) NOT NULL,
    performed_by character varying(36),
    performed_by_name character varying(100),
    description text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_audit_logs OWNER TO postgres;

--
-- Name: project_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_budgets (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    overall_budget numeric(15,2) NOT NULL,
    currency character varying(10) NOT NULL,
    notes text,
    created_by character varying(36),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_budgets OWNER TO postgres;

--
-- Name: project_clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_clients (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    client_id character varying(36) NOT NULL,
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_clients OWNER TO postgres;

--
-- Name: project_contractors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_contractors (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    contractor_id character varying(36) NOT NULL,
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_contractors OWNER TO postgres;

--
-- Name: project_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_documents (
    id character varying(36) NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(50) NOT NULL,
    project character varying(150) NOT NULL,
    uploaded_by character varying(100) NOT NULL,
    upload_date character varying(20) NOT NULL,
    size character varying(30) NOT NULL,
    category character varying(100) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_documents OWNER TO postgres;

--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_milestones (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    milestone_name character varying(150) NOT NULL,
    description text,
    planned_date character varying(20) NOT NULL,
    actual_completion_date character varying(20),
    completion_percentage integer NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_milestones OWNER TO postgres;

--
-- Name: project_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_schedules (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    phase_name character varying(100) NOT NULL,
    description text,
    planned_start_date character varying(20) NOT NULL,
    planned_end_date character varying(20) NOT NULL,
    estimated_duration integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_schedules OWNER TO postgres;

--
-- Name: project_site_engineers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_site_engineers (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    site_engineer_id character varying(36) NOT NULL,
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_site_engineers OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id character varying(36) NOT NULL,
    project_name character varying(150) NOT NULL,
    project_code character varying(50) NOT NULL,
    category character varying(100) NOT NULL,
    client_name character varying(150) NOT NULL,
    client_contact character varying(100),
    description text,
    location character varying(200) NOT NULL,
    estimated_budget double precision NOT NULL,
    priority character varying(20) NOT NULL,
    status character varying(30) NOT NULL,
    start_date character varying(20) NOT NULL,
    expected_completion_date character varying(20) NOT NULL,
    project_manager_id character varying(36),
    created_by character varying(36),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id character varying(36) NOT NULL,
    purchase_order_id character varying(36) NOT NULL,
    material_id character varying(36),
    description character varying(200) NOT NULL,
    quantity double precision NOT NULL,
    received_quantity double precision NOT NULL,
    unit character varying(50) NOT NULL,
    unit_price double precision NOT NULL,
    tax double precision NOT NULL,
    discount double precision NOT NULL,
    line_total double precision NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id character varying(36) NOT NULL,
    purchase_order_id character varying(50) NOT NULL,
    vendor_id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    procurement_request_id character varying(36),
    order_date character varying(20) NOT NULL,
    expected_delivery_date character varying(20) NOT NULL,
    subtotal double precision NOT NULL,
    tax_amount double precision NOT NULL,
    additional_charges double precision NOT NULL,
    total_amount double precision NOT NULL,
    purchase_order_status character varying(30) NOT NULL,
    remarks text,
    created_by_id character varying(36),
    created_by_name character varying(150) NOT NULL,
    approved_by_id character varying(36),
    approved_by_name character varying(150),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id character varying(36) NOT NULL,
    report_name character varying(150) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: resource_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_allocations (
    id character varying(36) NOT NULL,
    resource_id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    allocation_date character varying(20) NOT NULL,
    expected_return_date character varying(20) NOT NULL,
    actual_return_date character varying(20),
    responsible_person_id character varying(36),
    responsible_person_name character varying(100),
    location character varying(150),
    notes text,
    status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.resource_allocations OWNER TO postgres;

--
-- Name: resource_maintenances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_maintenances (
    id character varying(36) NOT NULL,
    resource_id character varying(36) NOT NULL,
    maintenance_date character varying(20) NOT NULL,
    next_maintenance_date character varying(20),
    maintenance_type character varying(50) NOT NULL,
    service_engineer character varying(100),
    maintenance_cost double precision NOT NULL,
    status character varying(30) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.resource_maintenances OWNER TO postgres;

--
-- Name: resource_utilizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_utilizations (
    id character varying(36) NOT NULL,
    resource_id character varying(36) NOT NULL,
    project_id character varying(36),
    date character varying(20) NOT NULL,
    operating_hours double precision NOT NULL,
    idle_hours double precision NOT NULL,
    total_available_hours double precision NOT NULL,
    utilization_percentage double precision NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.resource_utilizations OWNER TO postgres;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id character varying(36) NOT NULL,
    equipment_code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    category character varying(50) NOT NULL,
    description text,
    status character varying(50) NOT NULL,
    location character varying(150) NOT NULL,
    responsible_person_id character varying(36),
    responsible_person_name character varying(100),
    project_id character varying(36),
    serial_number character varying(100),
    purchase_date character varying(20),
    purchase_cost double precision NOT NULL,
    utilization_percentage double precision NOT NULL,
    created_by character varying(36),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying(36) NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id character varying(36) NOT NULL,
    shift_name character varying(100) NOT NULL,
    worker_name character varying(100),
    date character varying(20) NOT NULL,
    shift_type character varying(20) NOT NULL,
    shift_start character varying(10) NOT NULL,
    shift_end character varying(10) NOT NULL,
    location character varying(150) NOT NULL,
    project character varying(150) NOT NULL,
    project_id character varying(36),
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: site_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_activity_logs (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    activity_date character varying(20) NOT NULL,
    activity_time character varying(10),
    description text NOT NULL,
    event_type character varying(50) NOT NULL,
    responsible_person character varying(100) NOT NULL,
    location character varying(150),
    workers_count integer NOT NULL,
    weather character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.site_activity_logs OWNER TO postgres;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id character varying(36) NOT NULL,
    material_id character varying(36) NOT NULL,
    project_id character varying(36),
    movement_type character varying(30) NOT NULL,
    quantity double precision NOT NULL,
    movement_date character varying(20) NOT NULL,
    user_id character varying(36),
    user_name character varying(150) NOT NULL,
    reference_id character varying(100),
    remarks text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(36) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(120) NOT NULL,
    mobile character varying(20),
    password_hash character varying(255) NOT NULL,
    employee_id character varying(50),
    department character varying(100),
    designation character varying(100),
    address character varying(255),
    profile_picture character varying(255),
    role_id character varying(36) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id character varying(36) NOT NULL,
    vendor_id character varying(50) NOT NULL,
    vendor_name character varying(150) NOT NULL,
    contact_person character varying(100),
    contact_number character varying(50),
    email character varying(100),
    address text,
    vendor_category character varying(100) NOT NULL,
    products_or_services_supplied text,
    vendor_status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: weekly_progress_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_progress_reports (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    week_start_date character varying(20) NOT NULL,
    week_end_date character varying(20) NOT NULL,
    completed_work text,
    weekly_progress_percentage integer NOT NULL,
    planned_progress_percentage integer NOT NULL,
    next_week_targets text,
    worker_hours double precision NOT NULL,
    worker_count integer NOT NULL,
    major_activities text,
    delays text,
    safety_incidents text,
    overall_status character varying(30) NOT NULL,
    generated_by character varying(100) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.weekly_progress_reports OWNER TO postgres;

--
-- Name: work_completion_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_completion_status (
    id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    overall_completion_percentage integer NOT NULL,
    category_breakdown json,
    computed_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.work_completion_status OWNER TO postgres;

--
-- Name: worker_project_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_project_assignments (
    id character varying(36) NOT NULL,
    worker_id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    contractor_id character varying(36),
    work_activity character varying(200),
    assignment_start_date character varying(20) NOT NULL,
    assignment_end_date character varying(20),
    assignment_status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.worker_project_assignments OWNER TO postgres;

--
-- Name: worker_shift_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_shift_assignments (
    id character varying(36) NOT NULL,
    shift_id character varying(36) NOT NULL,
    worker_id character varying(36) NOT NULL,
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.worker_shift_assignments OWNER TO postgres;

--
-- Name: workers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workers (
    id character varying(36) NOT NULL,
    worker_id character varying(50) NOT NULL,
    worker_name character varying(150) NOT NULL,
    contact_information character varying(100),
    workforce_category_id character varying(36) NOT NULL,
    skill_or_work_type character varying(100),
    contractor_id character varying(36),
    joining_date character varying(20) NOT NULL,
    worker_status character varying(30) NOT NULL,
    pay_rate double precision NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.workers OWNER TO postgres;

--
-- Name: workforce_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workforce_categories (
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.workforce_categories OWNER TO postgres;

--
-- Name: workforce_payrolls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workforce_payrolls (
    id character varying(36) NOT NULL,
    worker_id character varying(36) NOT NULL,
    project_id character varying(36) NOT NULL,
    pay_period_start character varying(20) NOT NULL,
    pay_period_end character varying(20) NOT NULL,
    pay_rate double precision NOT NULL,
    working_days double precision NOT NULL,
    working_hours double precision NOT NULL,
    overtime_hours double precision NOT NULL,
    leave_days double precision NOT NULL,
    attendance_reference text,
    estimated_pay double precision NOT NULL,
    payroll_status character varying(30) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.workforce_payrolls OWNER TO postgres;

--
-- Data for Name: actual_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actual_expenses (id, expense_code, project_id, category, amount, description, expense_date, source_reference, worker_id, material_id, equipment_id, purchase_order_id, created_by, created_at, updated_at) FROM stdin;
29f064a9-7093-457e-a71a-9e731b084484	EXP-MAT-0001	65f67efc-9154-40de-a5ff-44dd7d642774	Material	20000.00	Material received for PO PO-2026-002: Portland Cement 50kg (50.0 Bags)	2026-09-03	PO:PO-2026-002	\N	\N	\N	0a4806a1-4d9e-44c3-8cfc-378e906df35c	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	2026-09-04 09:32:21.487542+05:30	2026-09-04 09:32:21.487544+05:30
0a2bf465-375a-48f2-9a9f-947cb0299a2e	EXP-MAT-0002	65f67efc-9154-40de-a5ff-44dd7d642774	Material	20000.00	Material received for PO PO-2026-002: Portland Cement 50kg (50.0 Bags)	2026-09-05	PO:PO-2026-002	\N	\N	\N	0a4806a1-4d9e-44c3-8cfc-378e906df35c	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	2026-09-04 09:32:21.502274+05:30	2026-09-04 09:32:21.502277+05:30
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
010_update_task_foreign_keys
\.


--
-- Data for Name: assigned_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assigned_tasks (id, title, description, project, assigned_to, priority, status, due_date, location, created_at, project_id, assigned_to_id, milestone_id, contractor_id, worker_id) FROM stdin;
79768309-983c-427f-b53d-c5a44b1b88e0	Install rebar grid – Level 5 East Wing	Complete Grade 60 rebar installation on Level 5 east perimeter.	Skyline Tower	Robert Thorne	High	In Progress	2026-08-05	Block A – Level 5	2026-09-04 08:48:34.693873+05:30	\N	\N	\N	\N	\N
e7f03653-0343-4435-92eb-10a5ef9ba0ce	Waterproofing Basement B2	Apply membrane waterproofing on all B2 walls.	Skyline Tower	Carlos Mendez	High	Open	2026-08-08	Basement B2	2026-09-04 08:48:34.693906+05:30	\N	\N	\N	\N	\N
1b9f47e7-aed5-4022-bbc3-e3fa642413bc	Install Reinforcement Mesh B	Install high-tensile steel mesh	Nexus Tech Park Campus Revamped	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	High	Open	2026-10-15	\N	2026-09-04 08:49:07.185689+05:30	\N	\N	\N	\N	\N
90eada72-cd7a-40f8-9dc7-31bdcb899d26	Install Reinforcement Mesh B	Install high-tensile steel mesh	Nexus Tech Park Campus Revamped	Jackson Reed	High	Open	2026-10-15	\N	2026-09-04 09:30:44.499225+05:30	06b8d242-5554-4575-b786-2e0a243354bc	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	\N	\N	\N
0432a7b7-11aa-4028-8efb-adfbb7d2561a	Install Reinforcement Mesh B	Install high-tensile steel mesh	Nexus Tech Park Campus Revamped	Jackson Reed	High	Open	2026-10-15	\N	2026-09-04 09:32:21.71983+05:30	06b8d242-5554-4575-b786-2e0a243354bc	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	\N	\N	\N
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, worker_id, user_id, user_name, project_id, shift_id, date, day_name, shift_type, check_in, check_out, status, hours_worked, overtime_hours, remarks, location, created_at, updated_at) FROM stdin;
0d4e9543-bd0c-474b-a792-8f689b332064	\N		Robert Thorne	\N	\N	2026-08-03	Monday	Morning	06:05	14:10	Present	8	0	\N	Block A – Level 5	2026-09-04 08:48:34.736389+05:30	2026-09-04 08:48:34.736398+05:30
2837a601-e95e-4097-bd33-43eb21cc1055	\N		Robert Thorne	\N	\N	2026-08-02	Sunday	Morning	06:10	14:00	Present	7.8	0	\N	Block A – Level 5	2026-09-04 08:48:34.736423+05:30	2026-09-04 08:48:34.736427+05:30
f0b2c16b-d386-4b76-8378-3af79a0f99a2	\N		Robert Thorne	\N	\N	2026-08-01	Saturday	Afternoon	14:15	22:00	Late	7.5	0	\N	Basement B2	2026-09-04 08:48:34.736448+05:30	2026-09-04 08:48:34.736451+05:30
bdc95701-609e-48e1-87a4-716fd9cbbc2a	\N		Robert Thorne	\N	\N	2026-07-31	Friday	Morning	\N	\N	On Leave	0	0	\N		2026-09-04 08:48:34.736468+05:30	2026-09-04 08:48:34.73647+05:30
24d29c7e-e7e3-4ed4-8069-ddb35ee3623e	\N		Robert Thorne	\N	\N	2026-07-30	Thursday	Morning	06:00	14:02	Present	8	0	\N	Block A – Level 5	2026-09-04 08:48:34.736484+05:30	2026-09-04 08:48:34.736487+05:30
970f7da9-94ed-4225-8efd-9e65d0160d31	80d32d31-1af9-4cba-9a4a-afe6642c01ce		Field Worker	06b8d242-5554-4575-b786-2e0a243354bc	\N	2026-08-03	Monday	Morning	08:00	17:00	Present	9	1	Shift completed on time	\N	2026-09-04 08:48:35.10769+05:30	2026-09-04 08:48:35.107695+05:30
14a293f8-fd13-43ff-862b-8a8ce49f8d90	a53e63a4-5e2b-4d5e-9232-e250129bf137		Field Worker	06b8d242-5554-4575-b786-2e0a243354bc	\N	2026-08-03	Monday	Morning	08:15	17:15	Present	9	1	Formwork pour done	\N	2026-09-04 08:48:35.107707+05:30	2026-09-04 08:48:35.107708+05:30
d02d3a35-01c1-4d3a-9e60-34b647df6661	dcb45e4e-57bd-4c09-abe7-18e67cd1a5d1		Field Worker	06b8d242-5554-4575-b786-2e0a243354bc	\N	2026-08-03	Monday	Morning	07:45	16:45	Present	9	1	Safety audit conducted	\N	2026-09-04 08:48:35.107718+05:30	2026-09-04 08:48:35.10772+05:30
f84f9bb0-75c5-4479-8db5-e666b184c6be	f064237f-99fb-4f69-9c95-40fbae1f9d8b		Field Worker	06b8d242-5554-4575-b786-2e0a243354bc	\N	2026-08-03	Monday	Morning	\N	\N	Absent	0	0	Medical leave	\N	2026-09-04 08:48:35.107727+05:30	2026-09-04 08:48:35.107729+05:30
a1203098-58b1-412e-b8cc-3f663d11056e	a53e63a4-5e2b-4d5e-9232-e250129bf137		Field Worker	35f2b6aa-edb9-4c59-a1b5-b280819af623	\N	2026-08-15	Saturday	Morning	08:00	17:30	Present	9.5	1.5	Formwork slab inspection	\N	2026-09-04 08:48:36.241305+05:30	2026-09-04 08:48:36.241311+05:30
3421bdd7-9121-49ec-91bb-b0bcd5cbe698	\N		Day Shift	\N	\N	2026-08-10		Day	\N	\N	Present	0	0	\N	Site	2026-09-04 09:04:16.365074+05:30	2026-09-04 09:04:16.365077+05:30
e8570f72-8ead-423a-961d-8f3f3247cc23	\N		Day Shift	\N	\N	2026-08-10		Day	\N	\N	Present	0	0	\N	Site	2026-09-04 09:23:20.259264+05:30	2026-09-04 09:23:20.259267+05:30
b604381f-6f23-4e5d-8b67-14d5c841045e	a53e63a4-5e2b-4d5e-9232-e250129bf137		Field Worker	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	\N	2026-08-15	Saturday	Morning	08:00	17:30	Present	9.5	1.5	Formwork slab inspection	\N	2026-09-04 09:25:58.286444+05:30	2026-09-04 09:25:58.286447+05:30
\.


--
-- Data for Name: budget_category_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budget_category_allocations (id, budget_id, category, allocated_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contractor_workers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contractor_workers (id, contractor_id, worker_id, project_id, assigned_at) FROM stdin;
\.


--
-- Data for Name: cost_estimates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cost_estimates (id, estimate_code, project_id, category, amount, description, task_reference, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: daily_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_activity_logs (id, date, location, activity, progress_notes, weather_condition, workers_present, issues, submitted_by, status, created_at) FROM stdin;
9428dccc-262e-46c9-93b9-6f3068c84f76	2026-08-03	Block A – Basement Level 2	Concrete pouring for columns B7 through B14. Rebar inspection completed by structural team.	68% of columns complete. Curing compound applied.	Cloudy	42	Minor delay due to pump truck maintenance (2 hrs).	David Miller	Approved	2026-09-04 08:34:11.307577+05:30
4e2d2804-6bed-4d94-83a0-8aed57ff7bd4	2026-08-02	Foundation Pit – Grid C/D	Pile cap formwork installation and rebar cage lowering into pile caps.	All 12 pile caps on grid C prepped.	Sunny	58	None	David Miller	Approved	2026-09-04 08:34:11.307615+05:30
109d309b-013d-415b-bf3a-ef617a7e9eaa	2026-08-01	Site Office & Perimeter	Safety audit walkthrough. Updated site hazard signage. First-aid kits restocked.	All fire extinguishers checked.	Sunny	10	None	David Miller	Pending	2026-09-04 08:34:11.307632+05:30
\.


--
-- Data for Name: daily_progress_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_progress_reports (id, project_id, report_date, progress_category, work_completed, progress_percentage, contractor, worker_attendance, worker_count, worker_absent, worker_hours, machinery_used, materials_consumed, material_updates, cost_incurred, weather_conditions, safety_observations, quality_inspection_remarks, delays, delay_reasons, comments, reported_by, reported_by_id, status, created_at, updated_at) FROM stdin;
ea9945c1-a1d9-4fc9-b0b8-717034e355d8	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-03	Foundation	Pile cap formwork completed for Grid C/D; 12 pile caps prepped and rebar cages lowered.	85	Marcus Brody	42 workers present (Morning shift)	0	0	0	Concrete Pump Truck CP-8, Tower Crane TC-480	Grade 60 rebar (12 tons), formwork plywood (48 sheets)	\N	0	Cloudy	All personnel wore PPE; no safety incidents reported.	Rebar spacing within tolerance; inspection approved.	f	\N	Foundation work on track for completion this week.	David Miller	\N	Approved	2026-09-04 08:48:34.836419+05:30	2026-09-04 08:48:34.836426+05:30
42df631b-4fdb-4e77-ad72-5f9bff79ce27	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-04	Structural Work	Concrete pouring for columns B7-B14 completed. Curing compound applied.	40	Marcus Brody	58 workers present (Morning + Afternoon shifts)	0	0	0	Concrete Pump Truck CP-8	Ready-mix concrete (64 m3), curing compound (20 L)	\N	0	Sunny	Safety harnesses used at height; scaffold inspected before pour.	Concrete slump test passed (75mm).	t	2-hour delay due to pump truck maintenance.	Structural progress proceeding; minor delay logged.	David Miller	\N	Approved	2026-09-04 08:48:34.836442+05:30	2026-09-04 08:48:34.836444+05:30
8075d018-abdb-4b51-b36e-f4e5639ea67c	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-05	Electrical Work	Conduit installation on Level 5 East Wing; rough-in wiring started.	25	VoltWorks Electrical	12 electricians present	0	0	0	Bend saw, wire puller	Conduit pipes (300 m), junction boxes (40 units)	\N	0	Sunny	Lockout/tagout verified on live panels.	Conduit bends within 90° limit; approved.	f	\N	Electrical rough-in on schedule.	David Miller	\N	Pending	2026-09-04 08:48:34.836457+05:30	2026-09-04 08:48:34.836459+05:30
f0a2bb2a-b652-48dc-8051-75238121adf7	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-10	Structural Work	Level 6 column concrete pour completed and cured. Rebar inspected.	65	Marcus Brody	Day Shift	45	3	360	Concrete Pump Truck CP-8	Ready-mix concrete (50 m3)	null	2500	Sunny	Full PPE observed.	Slump test passed.	f	\N	Automated verification test daily report.	Jackson Reed	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Pending	2026-09-04 09:04:16.347342+05:30	2026-09-04 09:04:16.400868+05:30
2db4080b-4955-493e-bd56-b35b566106ce	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-10	Structural Work	Level 6 column concrete pour completed and cured. Rebar inspected.	65	Marcus Brody	Day Shift	45	3	360	Concrete Pump Truck CP-8	Ready-mix concrete (50 m3)	null	2500	Sunny	Full PPE observed.	Slump test passed.	f	\N	Automated verification test daily report.	Jackson Reed	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Pending	2026-09-04 09:23:20.245456+05:30	2026-09-04 09:23:20.293657+05:30
\.


--
-- Data for Name: delay_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delay_tracking (id, project_id, reason, duration_days, affected_work_category, category, severity, mitigation, impact_on_timeline, reported_date, reported_by, remarks, status, created_at, updated_at) FROM stdin;
99c5dbb1-5a3e-41d8-95ec-aa8323f4cb59	06b8d242-5554-4575-b786-2e0a243354bc	Concrete pump truck maintenance	1	Structural Work	Weather	High	\N	Minor - 2 hours lost on column pour; absorbed by float.	2026-08-04	David Miller	\N	Resolved	2026-09-04 08:48:34.885514+05:30	2026-09-04 08:48:34.88552+05:30
03aabe2b-b85e-4b8f-ada1-9259d221ea61	06b8d242-5554-4575-b786-2e0a243354bc	Weather: heavy rain forecast for foundation excavation	2	Foundation	Weather	High	\N	Potential 2-day slip on foundation completion if rain persists.	2026-08-02	David Miller	\N	Open	2026-09-04 08:48:34.885538+05:30	2026-09-04 08:48:34.88554+05:30
ec78fc27-fc75-4950-b886-5b9501eea170	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Heavy rainfall delayed concrete curing	2	Structural Work	Weather	High	\N	2-day slip on Level 6 slab pour	2026-08-10	Jackson Reed	Mitigated with night shift overtime. Resolved.	Resolved	2026-09-04 09:04:16.477014+05:30	2026-09-04 09:04:16.491921+05:30
e4021d72-a5d1-4aae-b079-4cfda660e509	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Heavy rainfall delayed concrete curing	2	Structural Work	Weather	High	\N	2-day slip on Level 6 slab pour	2026-08-10	Jackson Reed	Mitigated with night shift overtime. Resolved.	Resolved	2026-09-04 09:23:20.375434+05:30	2026-09-04 09:23:20.388754+05:30
\.


--
-- Data for Name: equipment_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_status (id, name, type, serial_no, location, operator, status, last_inspection, next_service, fuel_level, created_at) FROM stdin;
aaf67506-8e37-4ba0-b37f-b4d3aaa0add4	Tower Crane TC-480	Lifting Equipment	TC-480-A21	Block A – Floor 22+	James Watson	Operational	2026-07-28	2026-09-01	\N	2026-09-04 08:34:11.357513+05:30
fbc39fe7-978d-4b75-8e37-caae4714456e	Concrete Pump Truck CP-8	Heavy Machinery	CP8-B2026	Basement Zone C	Mike Torres	Operational	2026-07-30	2026-08-15	72	2026-09-04 08:34:11.35759+05:30
eca7cdd6-78a1-4d4f-938c-ca8429cf1e5d	Excavator CAT 390F	Heavy Machinery	CAT390F-3304	Foundation Pit	Unassigned	Under Maintenance	2026-07-15	2026-08-05	45	2026-09-04 08:34:11.357605+05:30
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_id, invoice_number, vendor_id, purchase_order_id, project_id, invoice_date, due_date, invoice_amount, payment_status, invoice_status, remarks, created_at, updated_at) FROM stdin;
250a3393-2e9b-46cb-9bb8-20e4ad8db26e	INV-2026-001	INV-APEX-9901	42d3b9fc-7d65-4634-9353-0ae74948e575	0a4806a1-4d9e-44c3-8cfc-378e906df35c	65f67efc-9154-40de-a5ff-44dd7d642774	2026-09-06	2026-10-06	42500	Paid	Received	Initial bill received\nNote: Paid via NEFT	2026-09-04 09:32:21.521301+05:30	2026-09-04 09:32:21.529863+05:30
\.


--
-- Data for Name: material_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_allocations (id, project_id, material_id, quantity, consumed_quantity, allocation_date, work_activity, responsible_user_id, responsible_user_name, request_id, remarks, status, created_at) FROM stdin;
aa3cac1c-4fb6-4779-a027-1df00ac9dfb4	06b8d242-5554-4575-b786-2e0a243354bc	07e63131-f016-4ac6-b548-ba13b743896c	200	200	2026-08-12	Basement slab casting	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	728ffa6f-ce2a-4e9a-96c3-0cdb6977603c	Allocated 300 bags	Consumed	2026-09-04 09:32:21.240627+05:30
d58165fc-ff98-43fd-be8e-353282a64dbe	06b8d242-5554-4575-b786-2e0a243354bc	08abd015-c1ef-4e3d-8e5a-442f28ce6236	400	250	2026-08-10	Foundation Block B Column Pours	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	92dce67c-5aec-43bf-b836-a4c1212fd26c	Allocated 400 bags	Allocated	2026-09-04 08:32:57.152624+05:30
ea7c3844-d49b-4b88-9195-0a258aaad1aa	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	62a6b369-313b-400e-9b00-901d2f92aaa7	200	200	2026-08-12	Basement slab casting	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	e4691a4a-61ce-4659-97c8-8e5292eab64a	Allocated 300 bags	Consumed	2026-09-04 08:47:37.029586+05:30
8abaed5f-514f-4a16-9385-a6683ba928d9	35f2b6aa-edb9-4c59-a1b5-b280819af623	a3049367-6894-4bec-bea7-79f8ad300ecd	200	200	2026-08-12	Basement slab casting	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	2ef0c251-b663-425f-9f80-48d6d2825ccc	Allocated 300 bags	Consumed	2026-09-04 08:48:22.663024+05:30
6f1a63f0-1ea2-44dc-b7db-9d959212059a	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	200	200	2026-08-12	Basement slab casting	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	c35d3394-1381-4323-a8e4-d877faaa921b	Allocated 300 bags	Consumed	2026-09-04 09:23:55.229881+05:30
\.


--
-- Data for Name: material_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_categories (id, name, description, created_at) FROM stdin;
a9aed0f9-fea6-4604-b39b-330b0ebe547c	Civil	Civil engineering construction materials, cement, rebar, gravel, and bricks.	2026-09-04 08:32:56.994503+05:30
ab3e6d39-5051-49a6-9004-e378dbbfba11	Cement	Structural binding materials, OPC, PPC, and specialized cement bags.	2026-09-04 08:32:56.994528+05:30
ab038a3b-669f-42ab-823c-320b3a42fc1f	Steel	High-strength TMT rebar, structural steel beams, binding wire, and mesh.	2026-09-04 08:32:56.994538+05:30
f8d2188a-337d-41c9-80d1-8024115f3c8e	Bricks	Standard red clay bricks, fly-ash bricks, AAC lightweight concrete blocks.	2026-09-04 08:32:56.994545+05:30
1eab0165-f493-41fa-a842-e4261de7aa4b	Sand	M-Sand (Manufactured Sand), River Sand, and fine aggregate materials.	2026-09-04 08:32:56.994553+05:30
6af5f272-f2f6-49c1-80ef-b414210f049d	Concrete	Ready-Mix Concrete (RMC), precast concrete elements, and aggregate.	2026-09-04 08:32:56.994564+05:30
59dc6e0d-3186-48fc-af70-0ddb2b1bdf55	Electrical Materials	Conduit pipes, copper wiring, DB panels, switches, and junction boxes.	2026-09-04 08:32:56.994571+05:30
c6f6d656-5624-4376-a595-60c288f665fe	Plumbing Materials	PVC/CPVC pipes, fittings, valves, water tanks, and sanitary fixtures.	2026-09-04 08:32:56.994579+05:30
4744f69b-921a-4102-8e4a-7400b6d40e72	Structural Materials	Cement, steel, sand	2026-09-04 08:47:37.330687+05:30
\.


--
-- Data for Name: material_inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_inventories (id, material_id, warehouse_location, total_stock, allocated_stock, consumed_stock, available_stock, min_stock_level, status, last_updated) FROM stdin;
89c60616-e301-4edf-bd41-cd3233d39685	0dafa284-035a-4958-b5bd-ad7acc4b4554	Main Warehouse	150	0	0	150	500	Low Stock	2026-09-04 08:48:22.721451+05:30
8a3b00b2-e565-479a-902a-e392fb6f6ca0	54700308-bee5-4965-93a6-bbe84737b9ea	Main Warehouse	150	0	0	150	500	Low Stock	2026-09-04 09:32:21.2816+05:30
5e6e4b36-3fd9-400a-9e21-18a5adedf5be	58e23074-0c22-46d4-87fb-db29995cae48	Steel Yard Zone A	80	0	0	80	20	In Stock	2026-09-04 08:32:57.102776+05:30
93570fdb-fdec-4b72-a20b-461bb9762e60	08abd015-c1ef-4e3d-8e5a-442f28ce6236	Main Central Store	3000	150	250	2850	500	In Stock	2026-09-04 08:32:57.27287+05:30
3fc7c485-0674-4bde-957e-13314a933d5e	b4174d82-d378-4664-9d8b-e9fb21d4021d	Main Warehouse	100	0	0	100	50	In Stock	2026-09-04 09:23:55.204944+05:30
c5a05175-1988-4873-a629-03a4f1864457	b4133cdf-185a-49fc-9d21-6f90bf39616d	Main Warehouse	100	0	0	100	50	In Stock	2026-09-04 08:47:36.957316+05:30
d718f7ed-e110-4837-bf8f-18770a062bb6	62a6b369-313b-400e-9b00-901d2f92aaa7	Central Depot A	1000	0	200	1000	250	In Stock	2026-09-04 08:47:37.104035+05:30
334ca7c5-d4fe-4505-94f4-4f6f28f0d470	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	Central Depot A	1000	0	200	1000	250	In Stock	2026-09-04 09:23:55.253536+05:30
f58f5314-cb97-4468-be7f-02e5a97269ba	dfe850d6-619d-4bd2-9636-1dcc76a2f27c	Main Warehouse	150	0	0	150	500	Low Stock	2026-09-04 08:47:37.148925+05:30
d94b7f4c-94e5-4574-ba21-4e937e90f875	56348d9f-be64-4d73-807d-153b9185d367	Main Warehouse	150	0	0	150	500	Low Stock	2026-09-04 09:23:55.269513+05:30
25db7906-ac03-413e-a26a-bef20ed733da	c8b7ca7c-124a-4515-9902-882e46ff3c5e	Main Warehouse	200	20	10	180	50	In Stock	2026-09-04 09:38:32.017236+05:30
3453d786-41d7-4e90-aa07-afc7da02b6a1	2b319e0b-2a4e-4aba-922d-9cd0f1450e12	Main Warehouse	100	0	0	100	50	In Stock	2026-09-04 08:48:22.629902+05:30
9bdb4598-4a53-4ce7-b244-583ea8f834db	a3049367-6894-4bec-bea7-79f8ad300ecd	Central Depot A	1000	0	200	1000	250	In Stock	2026-09-04 08:48:22.701573+05:30
4dbf8b51-7392-465a-904f-c72cadbfa942	f35650ad-068d-4e00-b29f-120b1c515b87	Main Warehouse	100	0	0	100	50	In Stock	2026-09-04 09:32:21.213502+05:30
8302e9fe-d6e6-4167-b3ec-ec47235a0eab	07e63131-f016-4ac6-b548-ba13b743896c	Central Depot A	1000	0	200	1000	250	In Stock	2026-09-04 09:32:21.265125+05:30
\.


--
-- Data for Name: material_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_requests (id, request_code, project_id, material_id, material_name, category_name, unit, required_quantity, required_date, work_activity, remarks, requested_by_id, requested_by_name, request_date, status, review_remarks, reviewed_by_id, reviewed_at, created_at) FROM stdin;
92dce67c-5aec-43bf-b836-a4c1212fd26c	MRQ-7D8F77	06b8d242-5554-4575-b786-2e0a243354bc	08abd015-c1ef-4e3d-8e5a-442f28ce6236	Portland OPC Cement 50kg Bags	Cement	Bags	500	2026-08-15	Foundation Block B Column Pours	Required for upcoming column pours	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Fulfilled	Approved for foundation phase	84b96a3e-3954-41cc-b5c3-ed1351dd899f	2026-09-04 08:32:57.136126+05:30	2026-09-04 08:32:57.120793+05:30
a21ebfc5-f784-428c-ac36-9896fe3ab6ec	MRQ-5BF5D5	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	b4133cdf-185a-49fc-9d21-6f90bf39616d	Shortage Test Material	Cement	Bags	500	2026-08-25	Shortage test pour	\N	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Pending	\N	\N	\N	2026-09-04 08:47:36.981646+05:30
e4691a4a-61ce-4659-97c8-8e5292eab64a	MRQ-703988	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	62a6b369-313b-400e-9b00-901d2f92aaa7	Audit High-Performance OPC Cement	Cement	Bags	300	2026-08-25	Basement slab casting	Urgent request	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Fulfilled	Approved for basement slab phase	84b96a3e-3954-41cc-b5c3-ed1351dd899f	2026-09-04 08:47:36.999499+05:30	2026-09-04 08:47:36.893121+05:30
46f6405f-d17e-4a5a-92de-f8580bde6ee1	MRQ-0F9F5F	35f2b6aa-edb9-4c59-a1b5-b280819af623	2b319e0b-2a4e-4aba-922d-9cd0f1450e12	Shortage Test Material	Cement	Bags	500	2026-08-25	Shortage test pour	\N	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Pending	\N	\N	\N	2026-09-04 08:48:22.639402+05:30
2ef0c251-b663-425f-9f80-48d6d2825ccc	MRQ-39B154	35f2b6aa-edb9-4c59-a1b5-b280819af623	a3049367-6894-4bec-bea7-79f8ad300ecd	Audit High-Performance OPC Cement	Cement	Bags	300	2026-08-25	Basement slab casting	Urgent request	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Fulfilled	Approved for basement slab phase	84b96a3e-3954-41cc-b5c3-ed1351dd899f	2026-09-04 08:48:22.647078+05:30	2026-09-04 08:48:22.601337+05:30
ff2248db-328a-40f2-a243-6b6d8ad57b97	MRQ-7E2938	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	b4174d82-d378-4664-9d8b-e9fb21d4021d	Shortage Test Material	Cement	Bags	500	2026-08-25	Shortage test pour	\N	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Pending	\N	\N	\N	2026-09-04 09:23:55.211929+05:30
c35d3394-1381-4323-a8e4-d877faaa921b	MRQ-DAD971	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	Audit High-Performance OPC Cement	Cement	Bags	300	2026-08-25	Basement slab casting	Urgent request	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Fulfilled	Approved for basement slab phase	84b96a3e-3954-41cc-b5c3-ed1351dd899f	2026-09-04 09:23:55.218461+05:30	2026-09-04 09:23:55.184789+05:30
3c163dfb-79cf-4715-b4ba-0d982cb16b43	MRQ-A5DFA8	06b8d242-5554-4575-b786-2e0a243354bc	f35650ad-068d-4e00-b29f-120b1c515b87	Shortage Test Material	Cement	Bags	500	2026-08-25	Shortage test pour	\N	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Pending	\N	\N	\N	2026-09-04 09:32:21.221687+05:30
728ffa6f-ce2a-4e9a-96c3-0cdb6977603c	MRQ-6CA653	06b8d242-5554-4575-b786-2e0a243354bc	07e63131-f016-4ac6-b548-ba13b743896c	Audit High-Performance OPC Cement	Cement	Bags	300	2026-08-25	Basement slab casting	Urgent request	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	2026-09-04	Fulfilled	Approved for basement slab phase	84b96a3e-3954-41cc-b5c3-ed1351dd899f	2026-09-04 09:32:21.229252+05:30	2026-09-04 09:32:21.195143+05:30
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id, material_code, name, category_id, category_name, unit_of_measure, unit_price, min_stock_level, description, status, created_by, created_at, updated_at) FROM stdin;
08abd015-c1ef-4e3d-8e5a-442f28ce6236	MAT-CEM-01	Portland OPC Cement 50kg Bags	\N	Cement	Bags	0	500	High-grade Ordinary Portland Cement for structural pours.	Active	Michael Sterling	2026-09-04 08:32:57.026819+05:30	2026-09-04 08:32:57.02683+05:30
58e23074-0c22-46d4-87fb-db29995cae48	MAT-STL-01	TMT Steel Rebar 12mm Grade 60	\N	Steel	Tons	0	20	Thermo-Mechanically Treated steel rebar for structural reinforcement.	Active	Michael Sterling	2026-09-04 08:32:57.062383+05:30	2026-09-04 08:32:57.06239+05:30
62a6b369-313b-400e-9b00-901d2f92aaa7	TEST-MAT-F155	Audit High-Performance OPC Cement	\N	Cement	Bags	0	250	Structural pour cement	Active	Michael Sterling	2026-09-04 08:47:36.775978+05:30	2026-09-04 08:47:36.826206+05:30
b4133cdf-185a-49fc-9d21-6f90bf39616d	SHORT-18A8	Shortage Test Material	\N	Cement	Bags	0	50	\N	Active	Michael Sterling	2026-09-04 08:47:36.928014+05:30	2026-09-04 08:47:36.92802+05:30
dfe850d6-619d-4bd2-9636-1dcc76a2f27c	LOWALERT-6DA8	Low Stock Alert Wire	\N	Electrical Materials	Units	0	500	\N	Active	Michael Sterling	2026-09-04 08:47:37.126187+05:30	2026-09-04 08:47:37.126194+05:30
a3049367-6894-4bec-bea7-79f8ad300ecd	TEST-MAT-47EC	Audit High-Performance OPC Cement	\N	Cement	Bags	0	250	Structural pour cement	Active	Michael Sterling	2026-09-04 08:48:22.538702+05:30	2026-09-04 08:48:22.562082+05:30
2b319e0b-2a4e-4aba-922d-9cd0f1450e12	SHORT-4FA8	Shortage Test Material	\N	Cement	Bags	0	50	\N	Active	Michael Sterling	2026-09-04 08:48:22.618819+05:30	2026-09-04 08:48:22.618822+05:30
0dafa284-035a-4958-b5bd-ad7acc4b4554	LOWALERT-2D9E	Low Stock Alert Wire	\N	Electrical Materials	Units	0	500	\N	Active	Michael Sterling	2026-09-04 08:48:22.712184+05:30	2026-09-04 08:48:22.712187+05:30
1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	TEST-MAT-D102	Audit High-Performance OPC Cement	\N	Cement	Bags	0	250	Structural pour cement	Active	Michael Sterling	2026-09-04 09:23:55.13241+05:30	2026-09-04 09:23:55.158773+05:30
b4174d82-d378-4664-9d8b-e9fb21d4021d	SHORT-FCD0	Shortage Test Material	\N	Cement	Bags	0	50	\N	Active	Michael Sterling	2026-09-04 09:23:55.196557+05:30	2026-09-04 09:23:55.19656+05:30
56348d9f-be64-4d73-807d-153b9185d367	LOWALERT-2084	Low Stock Alert Wire	\N	Electrical Materials	Units	0	500	\N	Active	Michael Sterling	2026-09-04 09:23:55.261086+05:30	2026-09-04 09:23:55.261089+05:30
07e63131-f016-4ac6-b548-ba13b743896c	TEST-MAT-0959	Audit High-Performance OPC Cement	\N	Cement	Bags	0	250	Structural pour cement	Active	Michael Sterling	2026-09-04 09:32:21.146655+05:30	2026-09-04 09:32:21.164998+05:30
f35650ad-068d-4e00-b29f-120b1c515b87	SHORT-A7D1	Shortage Test Material	\N	Cement	Bags	0	50	\N	Active	Michael Sterling	2026-09-04 09:32:21.206508+05:30	2026-09-04 09:32:21.206511+05:30
54700308-bee5-4965-93a6-bbe84737b9ea	LOWALERT-BA19	Low Stock Alert Wire	\N	Electrical Materials	Units	0	500	\N	Active	Michael Sterling	2026-09-04 09:32:21.272309+05:30	2026-09-04 09:32:21.272312+05:30
c8b7ca7c-124a-4515-9902-882e46ff3c5e	MAT-PROC-TEST	Portland Cement 50kg	4744f69b-921a-4102-8e4a-7400b6d40e72	Structural Materials	Bags	450	50	\N	Active	\N	2026-09-04 09:32:21.355914+05:30	2026-09-04 09:32:21.355916+05:30
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, project_id, title, message, type, notification_type, category, "time", reference_module, reference_id, is_read, created_at, read_at) FROM stdin;
b53816c7-8d41-431a-ae23-28ddc56d4eaa	84b96a3e-3954-41cc-b5c3-ed1351dd899f	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.696694+05:30	\N
d87dd585-fe6e-43db-b1e3-8433f9b2d605	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.714526+05:30	\N
c6777343-9f68-4f2d-9ec0-2ea3bcc2b917	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.71869+05:30	\N
f09957ca-8f22-46b9-bfa3-7e6f6cfcd4a7	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.723144+05:30	\N
d0bef851-41c7-4923-bd8e-bdfb86c4d971	d3669be2-d902-4d47-9863-d32a9ae0b697	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.727313+05:30	\N
fae4da02-dfc9-4d3a-aecc-d91195d2e606	481ecdd6-6025-43c8-9bd2-4d0f9ab08c70	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.731122+05:30	\N
0f499b5b-d55b-4aa5-8934-f70c85e9cfcf	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Metro Rapid Transit Tunnel' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	f	2026-09-04 09:33:48.734967+05:30	\N
8e41405b-1274-47a8-89bf-556cfafb4580	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	35f2b6aa-edb9-4c59-a1b5-b280819af623	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Apex Sky Towers & Residences' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	55175d06-58f4-460f-afab-bc156ffd3111	f	2026-09-04 09:33:48.743366+05:30	\N
ddf30a6e-2f83-4a67-bea7-a8810a2ff2a8	84b96a3e-3954-41cc-b5c3-ed1351dd899f	35f2b6aa-edb9-4c59-a1b5-b280819af623	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Apex Sky Towers & Residences' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	55175d06-58f4-460f-afab-bc156ffd3111	f	2026-09-04 09:33:48.746236+05:30	\N
3a73194f-2362-4dfa-a7f1-a02d295be3f2	481ecdd6-6025-43c8-9bd2-4d0f9ab08c70	35f2b6aa-edb9-4c59-a1b5-b280819af623	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Apex Sky Towers & Residences' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	55175d06-58f4-460f-afab-bc156ffd3111	f	2026-09-04 09:33:48.749206+05:30	\N
e1c032b8-6a95-438b-a435-b34f25dd2218	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	35f2b6aa-edb9-4c59-a1b5-b280819af623	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Apex Sky Towers & Residences' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	55175d06-58f4-460f-afab-bc156ffd3111	f	2026-09-04 09:33:48.751926+05:30	\N
ee7930a4-d0f2-4aae-97db-7f14abdfce37	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	65f67efc-9154-40de-a5ff-44dd7d642774	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Procurement Test Tower' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	1b9a9b80-42c4-4864-b631-cb64dd4cd32b	f	2026-09-04 09:33:48.758682+05:30	\N
d07ac116-161c-40e4-96c0-271b1e81f76f	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	65f67efc-9154-40de-a5ff-44dd7d642774	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Procurement Test Tower' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	1b9a9b80-42c4-4864-b631-cb64dd4cd32b	f	2026-09-04 09:33:48.762488+05:30	\N
ce51eebf-1303-44f5-affa-796581ec5b58	4ce8d1da-11b8-4361-9088-755be07814f6	65f67efc-9154-40de-a5ff-44dd7d642774	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Procurement Test Tower' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	1b9a9b80-42c4-4864-b631-cb64dd4cd32b	f	2026-09-04 09:33:48.765198+05:30	\N
4edd8479-058c-4208-9966-857b9311d916	481ecdd6-6025-43c8-9bd2-4d0f9ab08c70	65f67efc-9154-40de-a5ff-44dd7d642774	Milestone Overdue: Foundation Completion	Milestone 'Foundation Completion' for project 'Procurement Test Tower' was due on 2026-08-15.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	1b9a9b80-42c4-4864-b631-cb64dd4cd32b	f	2026-09-04 09:33:48.767743+05:30	\N
07250cb5-09d0-40cc-a9cf-5a3f19063375	ffeed8f5-d1a5-427e-abad-d60c9516cc05	87d3a261-bf2e-4a43-9073-1daf1e5b930e	Milestone Overdue: Framing & Columns	Milestone 'Framing & Columns' for project 'M10 Assigned Tower' was due on 2026-09-01.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	54defeef-ec2e-41c2-8711-3df579ddc215	f	2026-09-04 09:33:48.774495+05:30	\N
db31cc20-d534-45b3-a15f-96f5e63fde6c	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	87d3a261-bf2e-4a43-9073-1daf1e5b930e	Milestone Overdue: Framing & Columns	Milestone 'Framing & Columns' for project 'M10 Assigned Tower' was due on 2026-09-01.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	54defeef-ec2e-41c2-8711-3df579ddc215	f	2026-09-04 09:33:48.778242+05:30	\N
cadcc3e2-cac4-429e-afd7-017882ac3a73	481ecdd6-6025-43c8-9bd2-4d0f9ab08c70	87d3a261-bf2e-4a43-9073-1daf1e5b930e	Milestone Overdue: Framing & Columns	Milestone 'Framing & Columns' for project 'M10 Assigned Tower' was due on 2026-09-01.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	54defeef-ec2e-41c2-8711-3df579ddc215	f	2026-09-04 09:33:48.781119+05:30	\N
96989dcd-a8ee-4907-99eb-e11493c91c62	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	87d3a261-bf2e-4a43-9073-1daf1e5b930e	Milestone Overdue: Framing & Columns	Milestone 'Framing & Columns' for project 'M10 Assigned Tower' was due on 2026-09-01.	DEADLINE	danger	Deadline	Sep 04, 2026 04:03	milestones	54defeef-ec2e-41c2-8711-3df579ddc215	f	2026-09-04 09:33:48.783867+05:30	\N
7ef6155d-cd71-48c1-ac9d-b27e17b63860	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	\N	Alert 2	\N	SYSTEM	info	System	Sep 04, 2026 04:02	\N	\N	t	2026-09-04 09:32:21.829671+05:30	2026-09-04 09:32:21.8516+05:30
4fc4bec5-c9c2-430e-989e-7817370ed6e1	84b96a3e-3954-41cc-b5c3-ed1351dd899f	06b8d242-5554-4575-b786-2e0a243354bc	Budget Limit Exceeded Alert	Project 'Nexus Tech Park Campus Revamped' expenses (₹100,000.00) have exceeded planned budget (₹60,000.00) by ₹40,000.00.	DEADLINE	danger	Budget Alert	Sep 04, 2026 04:02	budget	c237320c-b579-4218-993e-90ffd5d98ea1	f	2026-09-04 09:32:23.576911+05:30	\N
ca0120c3-10b5-42ef-ad8a-89a0b1cd748b	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	\N	Alert 1	\N	SYSTEM	info	System	Sep 04, 2026 04:02	\N	\N	t	2026-09-04 09:32:21.82479+05:30	2026-09-04 09:32:21.867649+05:30
\.


--
-- Data for Name: procurement_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurement_categories (id, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: procurement_request_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurement_request_items (id, procurement_request_id, material_id, item_description, category_name, required_quantity, available_stock, net_procurement_quantity, unit, required_date, remarks) FROM stdin;
3a6fbe64-e810-4286-bb35-118f4544c905	c8078349-df83-4d7b-aea2-145e6decdc7b	\N	Portland Cement Grade 53	Raw Materials	100	0	100	Bags	2026-10-01	\N
d5d3febc-b3a0-4712-9363-69ac0a8f195b	a670b34b-803d-4be7-9140-3077d5212184	\N	Portland Cement Grade 53	Raw Materials	100	0	100	Bags	2026-10-01	\N
b8d2cb59-356d-4562-8a77-09f761f6a8f8	94fc5598-b865-489e-8a6c-87b1663a53b2	\N	Portland Cement Grade 53	Raw Materials	100	0	100	Bags	2026-10-01	\N
ba0ebb71-5e0f-46e2-90a1-730b1f14cb3c	57eb0a9f-34fd-4e15-8f63-07dcb961ce67	c8b7ca7c-124a-4515-9902-882e46ff3c5e	Portland Cement 50kg	Raw Materials	200	70	130	Bags	2026-09-01	Stage 2 pouring
90ac6d24-aa94-483d-a2f2-01d29b109f4c	0a8a27ca-a304-4e77-ad7d-1be3abb738cb	\N	Portland Cement Grade 53	Raw Materials	100	0	100	Bags	2026-10-01	\N
\.


--
-- Data for Name: procurement_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurement_requests (id, request_id, project_id, category_name, purpose, priority, request_date, request_status, remarks, requested_by_id, requested_by_name, approved_by_id, approved_by_name, approved_at, rejected_by_id, rejected_by_name, rejected_at, rejection_reason, created_at, updated_at) FROM stdin;
c8078349-df83-4d7b-aea2-145e6decdc7b	PR-2026-002	06b8d242-5554-4575-b786-2e0a243354bc	Raw Materials	Concrete pouring batch 5	High	2026-09-04	Approved	Approval Note: Approved for site work	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	2026-09-04 08:49:07.606682+05:30	\N	\N	\N	\N	2026-09-04 08:49:07.513177+05:30	2026-09-04 08:49:07.607954+05:30
a670b34b-803d-4be7-9140-3077d5212184	PR-2026-004	06b8d242-5554-4575-b786-2e0a243354bc	Raw Materials	Concrete pouring batch 5	High	2026-09-04	Approved	Approval Note: Approved for site work	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	2026-09-04 09:29:14.894239+05:30	\N	\N	\N	\N	2026-09-04 09:29:14.82308+05:30	2026-09-04 09:29:14.895295+05:30
94fc5598-b865-489e-8a6c-87b1663a53b2	PR-2026-005	06b8d242-5554-4575-b786-2e0a243354bc	Raw Materials	Concrete pouring batch 5	High	2026-09-04	Approved	Approval Note: Approved for site work	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	2026-09-04 09:30:44.665544+05:30	\N	\N	\N	\N	2026-09-04 09:30:44.617717+05:30	2026-09-04 09:30:44.666459+05:30
57eb0a9f-34fd-4e15-8f63-07dcb961ce67	PR-2026-006	65f67efc-9154-40de-a5ff-44dd7d642774	Raw Materials	Cement requirement for Slab 2	High	2026-09-04	Approved	Urgent delivery needed\nApproval Note: Approved by PM for Slab 2	4ce8d1da-11b8-4361-9088-755be07814f6	PM Procurement User	4ce8d1da-11b8-4361-9088-755be07814f6	PM Procurement User	2026-09-04 09:32:21.439208+05:30	\N	\N	\N	\N	2026-09-04 09:32:21.408372+05:30	2026-09-04 09:32:21.439764+05:30
0a8a27ca-a304-4e77-ad7d-1be3abb738cb	PR-2026-007	06b8d242-5554-4575-b786-2e0a243354bc	Raw Materials	Concrete pouring batch 5	High	2026-09-04	Approved	Approval Note: Approved for site work	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	2026-09-04 09:32:21.802868+05:30	\N	\N	\N	\N	2026-09-04 09:32:21.757995+05:30	2026-09-04 09:32:21.803217+05:30
\.


--
-- Data for Name: procurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procurements (id, title, supplier, material_name, expected_delivery_date, po_number, amount, project_id, material_id, quantity, status, requested_by, created_at) FROM stdin;
4c590f54-1d0f-4929-a23a-f77f02c5eb01	Site progress cost: Level 6 column concrete pour completed and cured.	\N	\N	\N	\N	2500	\N	\N	0	Pending Approval	\N	2026-09-04 09:04:16.370481+05:30
66f20fd5-6175-4e7a-b72e-3f13a788191a	Site progress cost: Level 6 column concrete pour completed and cured.	\N	\N	\N	\N	2500	\N	\N	0	Pending Approval	\N	2026-09-04 09:23:20.265169+05:30
\.


--
-- Data for Name: progress_photographs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progress_photographs (id, report_id, photo_url, caption, uploaded_by, created_at) FROM stdin;
0e8be5af-cffe-4cf5-a930-71d0a14d2ee9	f0a2bb2a-b652-48dc-8051-75238121adf7	https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500	\N	Jackson Reed	2026-09-04 09:04:16.360345+05:30
623c417b-ba1e-4c9e-9cc7-c9500284ed1e	2db4080b-4955-493e-bd56-b35b566106ce	https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500	\N	Jackson Reed	2026-09-04 09:23:20.252317+05:30
\.


--
-- Data for Name: project_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_audit_logs (id, project_id, action, performed_by, performed_by_name, description, created_at) FROM stdin;
2509c821-f9f1-4eba-9b39-3743603cbfbc	06b8d242-5554-4575-b786-2e0a243354bc	PROJECT_UPDATED	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	Updated: name	2026-09-04 08:47:38.174031+05:30
32926980-8564-4744-9ebc-19d06521646b	06b8d242-5554-4575-b786-2e0a243354bc	PROJECT_UPDATED	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	Updated: name	2026-09-04 08:49:06.932234+05:30
8a769be0-9130-4b93-9198-bb88d7a099b3	06b8d242-5554-4575-b786-2e0a243354bc	PROJECT_UPDATED	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	Updated: name	2026-09-04 09:29:14.606555+05:30
a627231e-9282-4b00-9370-56437f1bbc38	06b8d242-5554-4575-b786-2e0a243354bc	PROJECT_UPDATED	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	Updated: name	2026-09-04 09:30:44.422383+05:30
a850f0c6-1d2d-48fd-9b31-cd9c987e47c5	06b8d242-5554-4575-b786-2e0a243354bc	PROJECT_UPDATED	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	Updated: name	2026-09-04 09:32:21.666323+05:30
\.


--
-- Data for Name: project_budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_budgets (id, project_id, overall_budget, currency, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_clients (id, project_id, client_id, assigned_at) FROM stdin;
3ae356f9-19e9-4c87-982d-82abccb5b377	06b8d242-5554-4575-b786-2e0a243354bc	d3669be2-d902-4d47-9863-d32a9ae0b697	2026-09-04 08:32:55.93493+05:30
dcb3095c-f0f4-4340-a85c-4da509a4ee03	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	d3669be2-d902-4d47-9863-d32a9ae0b697	2026-09-04 08:32:55.934952+05:30
16cc3343-d95c-42af-83c5-6179b83cc1a6	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	d3669be2-d902-4d47-9863-d32a9ae0b697	2026-09-04 08:32:55.934961+05:30
\.


--
-- Data for Name: project_contractors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_contractors (id, project_id, contractor_id, assigned_at) FROM stdin;
c73b8ddf-c156-41b5-9143-18c6aa798b4f	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-09-04 08:32:55.939138+05:30
0493c7b9-9b9c-4600-bfac-02633688ea17	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-09-04 08:32:55.93916+05:30
\.


--
-- Data for Name: project_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_documents (id, name, type, project, uploaded_by, upload_date, size, category, created_at) FROM stdin;
27b656c7-6a65-4c53-8959-0cb4c5a417e2	Structural Foundation Drawings – Rev C	PDF	Skyline Tower	David Miller	2026-07-20	18.4 MB	Engineering Drawing	2026-09-04 08:34:11.440301+05:30
35aef974-be61-43f7-8d8c-e492da582f59	Q2 2026 Construction Progress Report	PDF	Skyline Tower	Sarah Jenkins	2026-07-31	4.2 MB	Progress Report	2026-09-04 08:34:11.440327+05:30
\.


--
-- Data for Name: project_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_milestones (id, project_id, milestone_name, description, planned_date, actual_completion_date, completion_percentage, status, created_at, updated_at) FROM stdin;
0f504adf-7bfd-4a4e-ac94-b817c0bf1e2f	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Foundation Completion	Pile cap & foundation excavation	2026-08-15	\N	85	In Progress	2026-09-04 08:34:11.219272+05:30	2026-09-04 08:34:11.219284+05:30
76a31f8a-18b3-4b41-8871-cd3f293d367d	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Structural Superstructure	Columns & slab pours up to Level 10	2026-11-30	\N	40	In Progress	2026-09-04 08:34:11.219329+05:30	2026-09-04 08:34:11.219333+05:30
25cc3580-5eaa-4366-ba88-c632d6984ba2	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Electrical Rough-in	Electrical conduit & wiring	2027-02-28	\N	0	Pending	2026-09-04 08:34:11.219355+05:30	2026-09-04 08:34:11.219358+05:30
64f4dcf6-7423-48b5-a707-e0e9bc89fd3f	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Finishing Work & Inspection	Interior finishing and safety inspection	2027-05-30	\N	0	Pending	2026-09-04 08:34:11.219388+05:30	2026-09-04 08:34:11.219391+05:30
55175d06-58f4-460f-afab-bc156ffd3111	35f2b6aa-edb9-4c59-a1b5-b280819af623	Foundation Completion	Pile cap & foundation excavation	2026-08-15	\N	85	In Progress	2026-09-04 08:34:11.246156+05:30	2026-09-04 08:34:11.246175+05:30
a4fbc583-bf65-4498-ba35-0b5e131fba01	35f2b6aa-edb9-4c59-a1b5-b280819af623	Structural Superstructure	Columns & slab pours up to Level 10	2026-11-30	\N	40	In Progress	2026-09-04 08:34:11.246184+05:30	2026-09-04 08:34:11.246186+05:30
d263f0d1-7c92-41c1-97f8-d5c0af7edf29	35f2b6aa-edb9-4c59-a1b5-b280819af623	Electrical Rough-in	Electrical conduit & wiring	2027-02-28	\N	0	Pending	2026-09-04 08:34:11.246195+05:30	2026-09-04 08:34:11.246195+05:30
162fe48e-df1c-4bf7-bf74-2e6b9c43dcbf	35f2b6aa-edb9-4c59-a1b5-b280819af623	Finishing Work & Inspection	Interior finishing and safety inspection	2027-05-30	\N	0	Pending	2026-09-04 08:34:11.246203+05:30	2026-09-04 08:34:11.246204+05:30
1b9a9b80-42c4-4864-b631-cb64dd4cd32b	65f67efc-9154-40de-a5ff-44dd7d642774	Foundation Completion	Pile cap & foundation excavation	2026-08-15	\N	85	In Progress	2026-09-04 09:33:48.593948+05:30	2026-09-04 09:33:48.593951+05:30
b2ae92a4-96fd-4dbe-853d-aefa1017a232	87d3a261-bf2e-4a43-9073-1daf1e5b930e	Foundation Concrete	Pouring foundation	2026-06-01	\N	100	Completed	2026-09-04 08:47:42.862714+05:30	2026-09-04 08:47:42.862718+05:30
54defeef-ec2e-41c2-8711-3df579ddc215	87d3a261-bf2e-4a43-9073-1daf1e5b930e	Framing & Columns	Level 1 columns	2026-09-01	\N	50	In Progress	2026-09-04 08:47:42.862727+05:30	2026-09-04 08:47:42.862728+05:30
42dc5b11-d003-44ea-aeef-97828436cb47	6ecc8c23-5ba2-4065-836e-280814177b0c	Structural Superstructure	Columns & slab pours up to Level 10	2026-11-30	\N	40	In Progress	2026-09-04 08:47:54.221899+05:30	2026-09-04 08:47:54.221901+05:30
1532f5cc-3d50-4a29-b555-593f1b9ff871	6ecc8c23-5ba2-4065-836e-280814177b0c	Electrical Rough-in	Electrical conduit & wiring	2027-02-28	\N	0	Pending	2026-09-04 08:47:54.221913+05:30	2026-09-04 08:47:54.221915+05:30
002a412c-ff02-42f2-aec8-80ef48003b5b	6ecc8c23-5ba2-4065-836e-280814177b0c	Finishing Work & Inspection	Interior finishing and safety inspection	2027-05-30	\N	0	Pending	2026-09-04 08:47:54.221927+05:30	2026-09-04 08:47:54.22193+05:30
64db187b-29dc-4dff-8a8f-3b335bfb6994	6ecc8c23-5ba2-4065-836e-280814177b0c	Foundation Completion	Pile cap & foundation excavation	2026-08-15	2026-08-10	100	Completed	2026-09-04 08:47:54.221871+05:30	2026-09-04 08:47:55.082488+05:30
61eb129c-e246-4c78-98dd-41a50d3a6fd3	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Site Prep & Foundation	Ground compaction and slab foundation.	2025-09-30	2026-08-10	100	Completed	2026-09-04 08:32:55.961606+05:30	2026-09-04 09:04:16.460235+05:30
f6a01773-fe6a-40a4-9271-545e8ec1921c	65f67efc-9154-40de-a5ff-44dd7d642774	Structural Superstructure	Columns & slab pours up to Level 10	2026-11-30	\N	40	In Progress	2026-09-04 09:33:48.593959+05:30	2026-09-04 09:33:48.593959+05:30
458ac948-6a21-4143-920c-015f84f58d79	65f67efc-9154-40de-a5ff-44dd7d642774	Electrical Rough-in	Electrical conduit & wiring	2027-02-28	\N	0	Pending	2026-09-04 09:33:48.593963+05:30	2026-09-04 09:33:48.593963+05:30
37758208-f3e5-4116-9771-47dec1d58d90	65f67efc-9154-40de-a5ff-44dd7d642774	Finishing Work & Inspection	Interior finishing and safety inspection	2027-05-30	\N	0	Pending	2026-09-04 09:33:48.593965+05:30	2026-09-04 09:33:48.593966+05:30
736b9f1b-05fc-42c4-ae5e-39561205f305	06b8d242-5554-4575-b786-2e0a243354bc	Site Excavation & Substructure	Foundation excavation, pile caps, and basement slab pour.	2026-04-30	2026-04-28	100	Completed	2026-09-04 08:32:55.96155+05:30	2026-09-04 08:32:55.961556+05:30
a48c6c13-57d5-4dc5-847d-95bf0f988677	06b8d242-5554-4575-b786-2e0a243354bc	Structural Concrete & Steel Superstructure	Reinforced concrete columns, beams, and slab pours up to Level 15.	2026-10-31	\N	75	In Progress	2026-09-04 08:32:55.961574+05:30	2026-09-04 08:32:55.961576+05:30
31073ae4-003f-412a-8198-404967a5df52	06b8d242-5554-4575-b786-2e0a243354bc	Electrical & Mechanical Rough-in	HVAC ductwork, electrical conduit, and plumbing risers.	2027-04-30	\N	30	In Progress	2026-09-04 08:32:55.961585+05:30	2026-09-04 08:32:55.961587+05:30
77dcd11a-7fc9-4a4e-80a0-48d36eafcb26	06b8d242-5554-4575-b786-2e0a243354bc	Interior Finishing & Handover	Drywall, glass facade, interior fit-out, and final safety inspection.	2027-11-30	\N	0	Pending	2026-09-04 08:32:55.961594+05:30	2026-09-04 08:32:55.961596+05:30
66b11d30-9d3d-4ae9-8ec6-fe63c05615cf	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Steel Framing & Enclosure	Structural steel erection and roof cladding.	2026-03-31	2026-03-28	100	Completed	2026-09-04 08:32:55.961615+05:30	2026-09-04 08:32:55.961616+05:30
8d7af95d-ec68-46e8-88ac-776c70adac5e	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Final Commissioning & Handover	Facility testing and handover to Harbor Trade.	2026-07-31	2026-07-30	100	Completed	2026-09-04 08:32:55.961624+05:30	2026-09-04 08:32:55.961625+05:30
\.


--
-- Data for Name: project_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_schedules (id, project_id, phase_name, description, planned_start_date, planned_end_date, estimated_duration, created_at, updated_at) FROM stdin;
0e253f8e-9612-4fc4-b6ca-5fb5cd6b6eac	06b8d242-5554-4575-b786-2e0a243354bc	Phase 1: Substructure Excavation	Pile cap & basement slab excavation	2026-01-15	2026-04-30	105	2026-09-04 08:32:55.968097+05:30	2026-09-04 08:32:55.968105+05:30
28391ecd-6d21-4da1-b5f5-26a069c3eded	06b8d242-5554-4575-b786-2e0a243354bc	Phase 2: Superstructure Framing	Concrete columns, beams & slab pours	2026-05-01	2026-10-31	184	2026-09-04 08:32:55.968123+05:30	2026-09-04 08:32:55.968125+05:30
fb4bd63c-b831-4bc8-ad8a-c33ba9e6d2bc	06b8d242-5554-4575-b786-2e0a243354bc	Phase 3: MEP & Envelope	HVAC, electrical conduit & plumbing risers	2026-11-01	2027-04-30	181	2026-09-04 08:32:55.968135+05:30	2026-09-04 08:32:55.968136+05:30
e9d0f7ff-3114-4014-979d-ccbee3862343	06b8d242-5554-4575-b786-2e0a243354bc	Phase 4: Fit-out & Inspection	Interior finishing & safety sign-off	2027-05-01	2027-11-30	214	2026-09-04 08:32:55.968145+05:30	2026-09-04 08:32:55.968146+05:30
\.


--
-- Data for Name: project_site_engineers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_site_engineers (id, project_id, site_engineer_id, assigned_at) FROM stdin;
4687dd98-b07e-4742-ada9-7c266fba55c7	06b8d242-5554-4575-b786-2e0a243354bc	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	2026-09-04 08:32:55.944152+05:30
8baac8a4-40fd-47d9-ab53-63d34501ffe9	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	2026-09-04 08:32:55.94419+05:30
56707214-165c-4f35-9d03-ab320628ed27	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	2026-09-04 08:32:55.944207+05:30
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, project_name, project_code, category, client_name, client_contact, description, location, estimated_budget, priority, status, start_date, expected_completion_date, project_manager_id, created_by, created_at, updated_at) FROM stdin;
06b8d242-5554-4575-b786-2e0a243354bc	Nexus Tech Park Campus Revamped	BT-PRJ-2026-01	Commercial	Global Innovations Inc.	+1 (555) 014-7000	State-of-the-art tech campus featuring LEED-certified smart office towers, underground parking, and solar energy grid.	Silicon Valley Hub	60000	High	In Progress	2026-01-15	2027-11-30	84b96a3e-3954-41cc-b5c3-ed1351dd899f	\N	2026-09-04 08:32:55.895376+05:30	2026-09-04 09:32:23.566951+05:30
87d3a261-bf2e-4a43-9073-1daf1e5b930e	M10 Assigned Tower	BT-M10-P1	Commercial	M10 Client Corp	\N	Test M10 Project	Site Zone A	5000000	Medium	In Progress	2026-01-01	2026-12-31	ffeed8f5-d1a5-427e-abad-d60c9516cc05	\N	2026-09-04 08:47:42.838803+05:30	2026-09-04 08:47:42.838807+05:30
6ecc8c23-5ba2-4065-836e-280814177b0c	M10 Unassigned Bridge	BT-M10-P2	Infrastructure	City Transit	\N	Test M10 Unassigned Project	Site Zone B	10000000	Medium	Planning	2026-03-01	2026-12-31	481ecdd6-6025-43c8-9bd2-4d0f9ab08c70	\N	2026-09-04 08:47:42.848926+05:30	2026-09-04 08:47:42.848932+05:30
3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Metro Rapid Transit Tunnel	BT-PRJ-2026-02	Infrastructure	City Transit Authority	+1 (555) 019-3322	Underground rapid transit tunnel network connecting the financial district with deep-bore excavation.	Metropolitan Underground	60000	High	In Progress	2026-03-01	2028-06-30	84b96a3e-3954-41cc-b5c3-ed1351dd899f	\N	2026-09-04 08:32:55.895414+05:30	2026-09-04 08:47:43.730578+05:30
35f2b6aa-edb9-4c59-a1b5-b280819af623	Apex Sky Towers & Residences	BT-PRJ-2026-03	Residential	Apex Luxury Real Estate	+1 (555) 018-9900	Twin 45-story luxury residential towers featuring penthouse suites and automated subterranean parking.	Downtown Financial District	60000	Medium	Planning	2026-09-01	2028-12-31	84b96a3e-3954-41cc-b5c3-ed1351dd899f	\N	2026-09-04 08:32:55.895429+05:30	2026-09-04 08:49:44.360845+05:30
ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Harbor Gateway Logistics Center	BT-PRJ-2026-04	Industrial	Harbor Trade Logistics	+1 (555) 012-4411	High-capacity logistics facility featuring automated sorting bays, cold storage, and heavy transport terminals.	Port Industrial Zone	60000	Medium	Completed	2025-06-01	2026-07-31	84b96a3e-3954-41cc-b5c3-ed1351dd899f	\N	2026-09-04 08:32:55.895442+05:30	2026-09-04 09:31:58.865572+05:30
65f67efc-9154-40de-a5ff-44dd7d642774	Procurement Test Tower	PROJ-PROC-TEST	Commercial Construction	BuildTrack Test Client	\N	\N	Sector 62, Test City	5000000	Medium	In Progress	2026-01-01	2026-12-31	4ce8d1da-11b8-4361-9088-755be07814f6	\N	2026-09-04 09:32:21.352665+05:30	2026-09-04 09:32:21.352667+05:30
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, material_id, description, quantity, received_quantity, unit, unit_price, tax, discount, line_total) FROM stdin;
aaf570a8-749c-4d11-8785-f99f7d9705d8	0a4806a1-4d9e-44c3-8cfc-378e906df35c	c8b7ca7c-124a-4515-9902-882e46ff3c5e	Portland Cement 50kg	100	100	Bags	400	2000	1000	41000
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, purchase_order_id, vendor_id, project_id, procurement_request_id, order_date, expected_delivery_date, subtotal, tax_amount, additional_charges, total_amount, purchase_order_status, remarks, created_by_id, created_by_name, approved_by_id, approved_by_name, created_at, updated_at) FROM stdin;
f882cd20-2f9a-43fe-9e4d-42480194b31b	PO-M10-001	55d6d57c-6b73-4205-afec-ff1b063aa33a	87d3a261-bf2e-4a43-9073-1daf1e5b930e	\N	2026-05-10	2026-06-10	0	0	0	150000	Issued	\N	\N	Admin M10 Tester	\N	\N	2026-09-04 08:49:32.65416+05:30	2026-09-04 08:49:32.654169+05:30
0a4806a1-4d9e-44c3-8cfc-378e906df35c	PO-2026-002	42d3b9fc-7d65-4634-9353-0ae74948e575	65f67efc-9154-40de-a5ff-44dd7d642774	\N	2026-09-04	2026-09-05	41000	1000	500	42500	Completed	Standard purchase order	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	Admin Procurement User	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	Admin Procurement User	2026-09-04 09:32:21.456784+05:30	2026-09-04 09:32:21.501932+05:30
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, report_name, created_at) FROM stdin;
\.


--
-- Data for Name: resource_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_allocations (id, resource_id, project_id, allocation_date, expected_return_date, actual_return_date, responsible_person_id, responsible_person_name, location, notes, status, created_at) FROM stdin;
\.


--
-- Data for Name: resource_maintenances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_maintenances (id, resource_id, maintenance_date, next_maintenance_date, maintenance_type, service_engineer, maintenance_cost, status, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: resource_utilizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_utilizations (id, resource_id, project_id, date, operating_hours, idle_hours, total_available_hours, utilization_percentage, notes, created_at) FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, equipment_code, name, category, description, status, location, responsible_person_id, responsible_person_name, project_id, serial_number, purchase_date, purchase_cost, utilization_percentage, created_by, created_at, updated_at) FROM stdin;
6062730e-73b7-4385-b5d2-01fe1d7fb24c	EXC-101	Excavator Komatsu PC210	Excavators	\N	Allocated	Equipment Yard	\N	\N	06b8d242-5554-4575-b786-2e0a243354bc	\N	\N	0	85	\N	2026-09-04 08:48:34.983306+05:30	2026-09-04 08:48:34.983313+05:30
77c061f2-7c90-45f0-90d4-0a7041c1b5d8	MIX-101	Asphalt Paver Volvo P6820C	Concrete Mixers	\N	Allocated	Equipment Yard	\N	\N	6ecc8c23-5ba2-4065-836e-280814177b0c	\N	\N	0	60	\N	2026-09-04 08:48:34.983331+05:30	2026-09-04 08:48:34.983333+05:30
ff01eac7-6131-43bf-846f-1d2ed2ad336d	CRN-101	Mobile Crane Tadano ATF 220G-5	Cranes	\N	Under Maintenance	Equipment Yard	\N	\N	06b8d242-5554-4575-b786-2e0a243354bc	\N	\N	0	0	\N	2026-09-04 08:48:34.983343+05:30	2026-09-04 08:48:34.983344+05:30
8d1987ac-e0e1-4985-8724-e29b4d0f3b07	SAF-101	Safety Harness Kit	Safety Equipment	\N	Available	Equipment Yard	\N	\N	\N	\N	\N	0	0	\N	2026-09-04 08:48:34.983353+05:30	2026-09-04 08:48:34.983354+05:30
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
bb59b8ae-7a08-4bb2-b236-3e63f334615c	Administrator	Full system executive governance	2026-08-12 13:36:42.929316+05:30	2026-08-12 13:36:42.929319+05:30
d300887a-9d52-45cd-82dd-93d1b924d34d	Project Manager	Project scheduling & site management	2026-08-12 13:36:42.939103+05:30	2026-08-12 13:36:42.939106+05:30
bcd1c569-0694-4295-b87d-10e6131bf37f	Site Engineer	Daily site logs & engineering inspections	2026-08-12 13:36:42.94181+05:30	2026-08-12 13:36:42.941812+05:30
a4f85067-ca32-4181-8cb6-1f62cb1915f8	Contractor	Subcontractor crew & task execution	2026-08-12 13:36:42.947529+05:30	2026-08-12 13:36:42.947531+05:30
1b833140-c9f3-4698-b255-c5a3b51ca1ac	Worker	Field labor & attendance clock-in	2026-08-12 13:36:42.951254+05:30	2026-08-12 13:36:42.951256+05:30
ee2ac883-2096-4ea7-92d1-09603068bed2	Client	Read-only project progress oversight	2026-08-12 13:36:42.952814+05:30	2026-08-12 13:36:42.952816+05:30
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (id, shift_name, worker_name, date, shift_type, shift_start, shift_end, location, project, project_id, status, created_at) FROM stdin;
302ccf4d-c11d-4708-b49c-9ba4146796c6	Morning Shift	Robert Thorne	2026-08-03	Morning	06:00	14:00	Block A – Level 5	Skyline Tower	\N	Scheduled	2026-09-04 08:48:34.803404+05:30
06572c25-096d-49ae-abcf-206c71221494	Morning Shift	Carlos Mendez	2026-08-03	Morning	06:00	14:00	Basement B2	Skyline Tower	\N	Scheduled	2026-09-04 08:48:34.803428+05:30
e5e99051-b10d-429e-a304-9cad01db5e6d	Morning Shift	Maria Gonzalez	2026-08-03	Afternoon	14:00	22:00	Foundation Pit	Skyline Tower	\N	Scheduled	2026-09-04 08:48:34.803438+05:30
44dbd311-3894-44a7-adb6-f60381032d2e	Morning Shift	Robert Thorne	2026-08-02	Morning	06:00	14:00	Block A – Level 5	Skyline Tower	\N	Completed	2026-09-04 08:48:34.803446+05:30
c8cdc9e7-1139-460b-a489-bcf3db44d647	Morning Shift	James Watson	2026-08-02	Night	22:00	06:00	Tower Crane	Skyline Tower	\N	Completed	2026-09-04 08:48:34.803455+05:30
2da071ba-a14c-4405-b128-4b115d01a522	Night Pouring Shift		2026-08-10	Morning	22:00	06:00	Basement B2		35f2b6aa-edb9-4c59-a1b5-b280819af623	Scheduled	2026-09-04 08:48:36.165434+05:30
c94c3902-a7a1-4c38-91f3-b56f57171672	Night Pouring Shift		2026-08-10	Morning	22:00	06:00	Basement B2		ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Scheduled	2026-09-04 09:25:58.263499+05:30
\.


--
-- Data for Name: site_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_activity_logs (id, project_id, activity_date, activity_time, description, event_type, responsible_person, location, workers_count, weather, created_at) FROM stdin;
56784bcc-f53d-43d5-bd46-34a6c45ff994	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-05	08:00	Steel rebar delivery - 20 tons Grade 60 for Level 6.	Material Delivery	Marcus Brody	\N	0	Sunny	2026-09-04 08:48:34.907203+05:30
b3e354db-e4dc-4684-bb1b-a6195c679545	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-04	10:30	Tower crane TC-480 routine maintenance and lubrication.	Machinery Maintenance	James Watson	\N	0	Sunny	2026-09-04 08:48:34.907224+05:30
22dc2dae-c4e7-4dc5-8504-1332ea4652b5	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-04	07:30	Weekly toolbox safety meeting - focus on working at height.	Safety Meeting	David Miller	\N	0	Sunny	2026-09-04 08:48:34.907233+05:30
16f0da00-6cda-408c-80df-02c3e742d1ab	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-03	13:00	Structural engineer inspection of pile cap rebar cages.	Inspection	David Miller	\N	0	Sunny	2026-09-04 08:48:34.907241+05:30
811e89b7-1d91-4272-9321-9bec929f1046	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-01	11:00	Client site walkthrough - Apex Real Estate representatives.	Client Visit	Sarah Jenkins	\N	0	Sunny	2026-09-04 08:48:34.907248+05:30
ef119588-4ab7-423a-9428-1779ce07f23b	06b8d242-5554-4575-b786-2e0a243354bc	2026-07-31	09:00	Internal QA audit of foundation formwork quality.	Quality Audit	Alex Vance	\N	0	Sunny	2026-09-04 08:48:34.907256+05:30
f7429116-deff-4b1a-ae69-f9bbdcae42d6	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-10	09:30	Government structural safety audit inspection conducted. Certificate issued.	Government Inspection	Inspector Alex Vance	\N	0	Sunny	2026-09-04 09:04:16.501573+05:30
132cccd1-ad83-4529-8740-4eab955dcf15	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-10	09:30	Government structural safety audit inspection conducted. Certificate issued.	Government Inspection	Inspector Alex Vance	\N	0	Sunny	2026-09-04 09:23:20.400589+05:30
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, material_id, project_id, movement_type, quantity, movement_date, user_id, user_name, reference_id, remarks, created_at) FROM stdin;
d00cb977-bb41-4c21-9a8a-44a92a31e498	08abd015-c1ef-4e3d-8e5a-442f28ce6236	\N	Received	2000	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-1ECE26	Initial bulk delivery from UltraTech Cement	2026-09-04 08:32:57.088638+05:30
fc7a0026-db76-4fd0-a4f1-944dda9166fb	58e23074-0c22-46d4-87fb-db29995cae48	\N	Received	80	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-0A6BF8	Initial stock delivery from Tata Steel	2026-09-04 08:32:57.103577+05:30
7db18970-470e-4626-a0fb-eae682033a49	08abd015-c1ef-4e3d-8e5a-442f28ce6236	06b8d242-5554-4575-b786-2e0a243354bc	Allocated	400	2026-08-10	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	ALC-D397DF	Allocated 400 bags	2026-09-04 08:32:57.150898+05:30
3fae064c-586f-45f6-93f5-7743917a4b66	08abd015-c1ef-4e3d-8e5a-442f28ce6236	06b8d242-5554-4575-b786-2e0a243354bc	Consumed	250	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	CNS-02C561	Used for columns B1-B8	2026-09-04 08:32:57.167144+05:30
5213833d-a1d5-47c1-ace8-e4e5496295df	08abd015-c1ef-4e3d-8e5a-442f28ce6236	\N	Received	1000	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-1F6E52	Received against Purchase Order PO-2026-001	2026-09-04 08:32:57.274123+05:30
5b435448-baae-4251-9f75-f5dc6c84eb0b	62a6b369-313b-400e-9b00-901d2f92aaa7	\N	Received	1000	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-365426	Received 1000 bags delivery	2026-09-04 08:47:36.856845+05:30
0f51ce5b-9c62-4baf-b6f7-cd9173a88685	b4133cdf-185a-49fc-9d21-6f90bf39616d	\N	Received	100	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-4EA601	Received 100.0 Bags into Main Warehouse	2026-09-04 08:47:36.95879+05:30
705d7102-79c4-43a3-b21e-c4659b4e8cc6	62a6b369-313b-400e-9b00-901d2f92aaa7	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Allocated	300	2026-08-12	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	ALC-7D871A	Allocated 300 bags	2026-09-04 08:47:37.026828+05:30
e7775f2a-a5c0-4440-b322-8b17d6fc8466	62a6b369-313b-400e-9b00-901d2f92aaa7	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Consumed	200	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	CNS-28A8A6	Used for slab pour	2026-09-04 08:47:37.074689+05:30
77518898-ad49-4601-809f-592b7b941158	62a6b369-313b-400e-9b00-901d2f92aaa7	3ab9c3d1-3b4f-4446-8c79-b1ff6a71150c	Returned	100	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	RET-6058AD	Returning unused bags to store	2026-09-04 08:47:37.105188+05:30
d2ff5e12-dc1a-4d0a-9ac8-df2512daf208	dfe850d6-619d-4bd2-9636-1dcc76a2f27c	\N	Received	150	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-5425BE	Received 150.0 Units into Main Warehouse	2026-09-04 08:47:37.149984+05:30
eccc49a6-901d-43d3-98ff-ea229a3ba1cc	a3049367-6894-4bec-bea7-79f8ad300ecd	\N	Received	1000	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-8FD23E	Received 1000 bags delivery	2026-09-04 08:48:22.574932+05:30
795c2d5e-d025-49be-8f96-beb9ba82b789	2b319e0b-2a4e-4aba-922d-9cd0f1450e12	\N	Received	100	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-CFEBAA	Received 100.0 Bags into Main Warehouse	2026-09-04 08:48:22.630405+05:30
6c5dc86f-d559-48d1-9ba7-e8fc7e4c9b51	a3049367-6894-4bec-bea7-79f8ad300ecd	35f2b6aa-edb9-4c59-a1b5-b280819af623	Allocated	300	2026-08-12	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	ALC-259045	Allocated 300 bags	2026-09-04 08:48:22.661382+05:30
e7dae22d-6b1b-4d93-971f-5c8350dbfd52	a3049367-6894-4bec-bea7-79f8ad300ecd	35f2b6aa-edb9-4c59-a1b5-b280819af623	Consumed	200	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	CNS-C9465B	Used for slab pour	2026-09-04 08:48:22.686773+05:30
6f564bee-88c0-473d-9d82-14cb360d9d47	a3049367-6894-4bec-bea7-79f8ad300ecd	35f2b6aa-edb9-4c59-a1b5-b280819af623	Returned	100	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	RET-C871B5	Returning unused bags to store	2026-09-04 08:48:22.702201+05:30
c2fdbdc8-5697-4281-ab33-f3b80803f407	0dafa284-035a-4958-b5bd-ad7acc4b4554	\N	Received	150	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-C9BBB7	Received 150.0 Units into Main Warehouse	2026-09-04 08:48:22.722257+05:30
22cbf093-6cdf-4638-8589-455676e47809	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	\N	Received	1000	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-CD7C1E	Received 1000 bags delivery	2026-09-04 09:23:55.167035+05:30
d8a0bc45-4ad3-48d1-b1fa-9caa111b4ff5	b4174d82-d378-4664-9d8b-e9fb21d4021d	\N	Received	100	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-2BC459	Received 100.0 Bags into Main Warehouse	2026-09-04 09:23:55.205401+05:30
eb6f6efd-8439-4c53-82d9-e2c2e8573374	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Allocated	300	2026-08-12	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	ALC-D5D139	Allocated 300 bags	2026-09-04 09:23:55.228719+05:30
7e92bf8d-d4ee-4dd9-aac5-0ae56ba50426	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Consumed	200	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	CNS-756BF9	Used for slab pour	2026-09-04 09:23:55.243529+05:30
e691a11e-8833-476e-80d4-e442f1f81c57	1e6b4a0c-5e6b-4c2e-addc-fb0f9cb23c52	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	Returned	100	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	RET-632905	Returning unused bags to store	2026-09-04 09:23:55.253894+05:30
4c5c03db-e7c6-4aeb-9364-b02d2e92a018	56348d9f-be64-4d73-807d-153b9185d367	\N	Received	150	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-D417E2	Received 150.0 Units into Main Warehouse	2026-09-04 09:23:55.269971+05:30
41800968-33b6-41e3-bb06-368092fcab2b	07e63131-f016-4ac6-b548-ba13b743896c	\N	Received	1000	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-709FC0	Received 1000 bags delivery	2026-09-04 09:32:21.174978+05:30
2eaf5b7e-a2dc-4b9e-bc9e-7a7665c7d54e	f35650ad-068d-4e00-b29f-120b1c515b87	\N	Received	100	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-956EAF	Received 100.0 Bags into Main Warehouse	2026-09-04 09:32:21.21413+05:30
78e21f89-0aa6-4d26-8ef9-ee3e2b33b40c	07e63131-f016-4ac6-b548-ba13b743896c	06b8d242-5554-4575-b786-2e0a243354bc	Allocated	300	2026-08-12	84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	ALC-D18B5F	Allocated 300 bags	2026-09-04 09:32:21.239407+05:30
a289819c-4080-40bc-ac13-4e6cb79d412f	07e63131-f016-4ac6-b548-ba13b743896c	06b8d242-5554-4575-b786-2e0a243354bc	Consumed	200	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	CNS-BEEAC7	Used for slab pour	2026-09-04 09:32:21.255432+05:30
a11c0e83-3da7-442b-b12f-63a350d8f988	07e63131-f016-4ac6-b548-ba13b743896c	06b8d242-5554-4575-b786-2e0a243354bc	Returned	100	2026-09-04	5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	RET-BFF3AA	Returning unused bags to store	2026-09-04 09:32:21.265535+05:30
1f8b27df-58f5-4d3e-bc05-f00769658c79	54700308-bee5-4965-93a6-bbe84737b9ea	\N	Received	150	2026-09-04	ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	RCV-A94203	Received 150.0 Units into Main Warehouse	2026-09-04 09:32:21.282345+05:30
0b6d595d-5bf5-4100-98a3-6ca45ccc3db9	c8b7ca7c-124a-4515-9902-882e46ff3c5e	65f67efc-9154-40de-a5ff-44dd7d642774	Received	50	2026-09-03	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	Admin Procurement User	PO-2026-002	Goods Receipt for PO PO-2026-002. Partial delivery challan #DC-101	2026-09-04 09:32:21.485591+05:30
bc672867-0f6a-4d7d-9c78-5c6013ffb8e5	c8b7ca7c-124a-4515-9902-882e46ff3c5e	65f67efc-9154-40de-a5ff-44dd7d642774	Received	50	2026-09-05	a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	Admin Procurement User	PO-2026-002	Goods Receipt for PO PO-2026-002. Final delivery completed	2026-09-04 09:32:21.501142+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, mobile, password_hash, employee_id, department, designation, address, profile_picture, role_id, is_active, created_at, updated_at) FROM stdin;
non-assigned-pm-m11-id	Unauthorized PM User	unauthorized.pm@buildtrack.com	\N	fakehash	\N	\N	\N	\N	\N	d300887a-9d52-45cd-82dd-93d1b924d34d	t	2026-09-04 07:55:31.197712+05:30	2026-09-04 07:55:31.197717+05:30
ef3d70f4-879c-4c96-83c9-545e5b0e0e1e	Michael Sterling	admin@buildtrack.com	+1 555-0199	$2b$12$F91wwbkiDgOhSYAKABPK6.SOHKNIof5paojLOn6AsDWz6eIk6RpW2	ADM-1001	Executive Management	Administrator	\N	\N	bb59b8ae-7a08-4bb2-b236-3e63f334615c	t	2026-08-12 13:36:43.182745+05:30	2026-08-12 18:01:22.765145+05:30
84b96a3e-3954-41cc-b5c3-ed1351dd899f	Elena Rostova	pm@buildtrack.com	+1 555-0199	$2b$12$WpiJVa3amccOA1/ReduOs.GcbbSpefvigsCQBCR0LaG8ULSGKjUw.	PM-2004	Project Operations	Project Manager	\N	\N	d300887a-9d52-45cd-82dd-93d1b924d34d	t	2026-08-12 13:36:43.392007+05:30	2026-08-12 18:01:22.765145+05:30
5ac32f98-13a7-4a1a-a8df-59f258d6a69a	Jackson Reed	engineer@buildtrack.com	+1 555-0199	$2b$12$d13E35i4Nv4DJtzkJ6quF.FxoTZ42zN3wxAUq6mcWltpQUdLmDwTW	ENG-3012	Civil Engineering	Site Engineer	\N	\N	bcd1c569-0694-4295-b87d-10e6131bf37f	t	2026-08-12 13:36:43.594169+05:30	2026-08-12 18:01:22.765145+05:30
8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Samuel Harris	contractor@buildtrack.com	+1 555-0199	$2b$12$enX9wwJgRrQLYL6o4HLFVeMDi4RIbWhQaqRGC6K4Ssvwk.qH8wycy	CON-4022	Structural Contracting	Contractor	\N	\N	a4f85067-ca32-4181-8cb6-1f62cb1915f8	t	2026-08-12 13:36:43.802969+05:30	2026-08-12 18:01:22.765145+05:30
535fd4d1-545b-4d53-8bfe-2eec00ffd1ba	Luis Gomez	worker@buildtrack.com	+1 555-0199	$2b$12$Dj91sFKh7asexulK/D0E/O43EgLn9gCQmPJi0bQNnndoHy9EXv5Mu	WRK-5099	Masonry & Steel	Worker	\N	\N	1b833140-c9f3-4698-b255-c5a3b51ca1ac	t	2026-08-12 13:36:44.006883+05:30	2026-08-12 18:01:22.765145+05:30
d3669be2-d902-4d47-9863-d32a9ae0b697	Global Innovations Rep	client@buildtrack.com	+1 555-0199	$2b$12$GrNHtKMpi66g7ztYFdlouOGCS3L68TIXJQJHHfBXG9k7zkeRbqP5W	CLI-9001	Client Representative	Client	\N	\N	ee2ac883-2096-4ea7-92d1-09603068bed2	t	2026-08-12 13:36:44.217637+05:30	2026-08-12 18:01:22.765145+05:30
481ecdd6-6025-43c8-9bd2-4d0f9ab08c70	Admin M10 Tester	admin_m10@test.com	\N	$2b$12$nDLABdIShmArkRSwtk4iTuN.Ytk1aJRJbXhRKYnnqSdtAZET5dMbS	\N	\N	\N	\N	\N	bb59b8ae-7a08-4bb2-b236-3e63f334615c	t	2026-09-04 00:39:28.310123+05:30	2026-09-04 00:39:28.310132+05:30
ffeed8f5-d1a5-427e-abad-d60c9516cc05	PM M10 Tester	pm_m10@test.com	\N	$2b$12$HwaoZ7J5kWpfaUXAHcKE1uwRJPHGXEi9ZJ45jB2eaHGUxVQy/UU7m	\N	\N	\N	\N	\N	d300887a-9d52-45cd-82dd-93d1b924d34d	t	2026-09-04 00:39:29.06234+05:30	2026-09-04 00:39:29.06235+05:30
d2e27a76-25ea-4a51-9371-09c62d4739ac	Worker M10 Tester	worker_m10@test.com	\N	$2b$12$Q4nINSc0.e96TQVHqTZa.uu0kb7HqrFPhRZ3z8e6wYLMJhVID6srK	\N	\N	\N	\N	\N	1b833140-c9f3-4698-b255-c5a3b51ca1ac	t	2026-09-04 00:39:29.980075+05:30	2026-09-04 00:39:29.980086+05:30
a19dbb44-baa6-47c9-a7f8-1bcfb7efd8b3	Admin Procurement User	admin_proc@test.com	\N	hashed_pass_test	\N	\N	\N	\N	\N	bb59b8ae-7a08-4bb2-b236-3e63f334615c	t	2026-08-23 17:38:52.399686+05:30	2026-08-23 17:38:52.399689+05:30
4ce8d1da-11b8-4361-9088-755be07814f6	PM Procurement User	pm_proc@test.com	\N	hashed_pass_test	\N	\N	\N	\N	\N	d300887a-9d52-45cd-82dd-93d1b924d34d	t	2026-08-23 17:38:52.415443+05:30	2026-08-23 17:38:52.415446+05:30
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, vendor_id, vendor_name, contact_person, contact_number, email, address, vendor_category, products_or_services_supplied, vendor_status, created_at, updated_at) FROM stdin;
55d6d57c-6b73-4205-afec-ff1b063aa33a	VEND-M10	M10 Test Vendor	Sales Rep	+1 555-0199	sales@m10vendor.com	\N	Raw Materials	\N	Active	2026-09-04 08:49:32.600058+05:30	2026-09-04 08:49:32.600069+05:30
42d3b9fc-7d65-4634-9353-0ae74948e575	VND-TEST-001	Apex Cement Corp	John Apex	+1 555-9988	sales@apexcement.com	100 Supply Ave	Raw Materials	Cement & Concrete Mix	Active	2026-09-04 09:32:21.366224+05:30	2026-09-04 09:32:21.379436+05:30
\.


--
-- Data for Name: weekly_progress_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weekly_progress_reports (id, project_id, week_start_date, week_end_date, completed_work, weekly_progress_percentage, planned_progress_percentage, next_week_targets, worker_hours, worker_count, major_activities, delays, safety_incidents, overall_status, generated_by, created_at) FROM stdin;
2e1302cc-1b81-43a4-8b7a-b15e3a0c18fd	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-03	2026-08-09	Foundation pile caps completed (85%). Column concrete pour for B7-B14 finished. Electrical conduit rough-in started on Level 5.	15	0	\N	0	0	Foundation Work, Structural Work, Electrical Work	Pump truck maintenance caused a 2-hour delay on 2026-08-04.	No major safety incidents recorded.	On Track	Sarah Jenkins	2026-09-04 08:48:34.862625+05:30
d0babeba-3ab1-4444-a927-b5016f781bd9	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-10	2026-08-16	- [2026-08-10] Structural Work: Level 6 column concrete pour completed and cured. Rebar inspected.	65	0		360	45	Structural Work	No delays recorded	No safety incidents reported.	On Track	Michael Sterling	2026-09-04 09:04:16.431695+05:30
abeffed6-c0c6-439c-9290-96935f5ae3e2	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-10	2026-08-16	- [2026-08-10] Structural Work: Level 6 column concrete pour completed and cured. Rebar inspected.\n- [2026-08-10] Structural Work: Level 6 column concrete pour completed and cured. Rebar inspected.	65	0		720	90	Structural Work	No delays recorded	No safety incidents reported.	On Track	Michael Sterling	2026-09-04 09:23:20.329223+05:30
\.


--
-- Data for Name: work_completion_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_completion_status (id, project_id, overall_completion_percentage, category_breakdown, computed_at, created_at) FROM stdin;
386a8776-a0fc-4ad2-a227-d7ff1a1a022c	06b8d242-5554-4575-b786-2e0a243354bc	37	{"Electrical Work": 25, "Structural Work": 40, "Foundation": 85}	2026-09-04 08:48:34.926515+05:30	2026-09-04 08:48:34.926521+05:30
97177a93-b612-49ab-983d-673c00b15e96	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	20	{"Structural Work": 65}	2026-09-04 09:04:16.404825+05:30	2026-09-04 09:04:16.378387+05:30
4530d83a-367d-44cf-ad5c-f48c1826a300	65f67efc-9154-40de-a5ff-44dd7d642774	0	{}	2026-09-04 09:38:40.442582+05:30	2026-09-04 09:38:40.442586+05:30
\.


--
-- Data for Name: worker_project_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_project_assignments (id, worker_id, project_id, contractor_id, work_activity, assignment_start_date, assignment_end_date, assignment_status, created_at, updated_at) FROM stdin;
74f04bef-d26b-4710-9b24-295ec5cd7bc8	a53e63a4-5e2b-4d5e-9232-e250129bf137	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Concrete Pouring & Formwork	2026-04-01	\N	Active	2026-09-04 08:48:35.076008+05:30	2026-09-04 08:48:35.07601+05:30
a929049e-3d5e-4cf5-9554-d6add5d4f04a	dcb45e4e-57bd-4c09-abe7-18e67cd1a5d1	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Site Safety & Crew Inspection	2026-04-01	\N	Active	2026-09-04 08:48:35.076018+05:30	2026-09-04 08:48:35.07602+05:30
a240d187-bb1d-4a90-b655-759843e0079e	f089edf6-f3f7-47ae-88c2-7d92aac8ca8a	06b8d242-5554-4575-b786-2e0a243354bc	\N	Structural Design Engineer	2026-04-01	\N	Active	2026-09-04 08:48:35.076027+05:30	2026-09-04 08:48:35.076028+05:30
4196768f-2902-4d22-a5f1-fbd39c8a44d0	54b42442-9fa7-48f8-991c-96d14dcf9b0d	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Tower Crane Operator	2026-04-01	\N	Active	2026-09-04 08:48:35.076042+05:30	2026-09-04 08:48:35.076043+05:30
eec655a1-6665-4442-b43d-458749cf9642	f064237f-99fb-4f69-9c95-40fbae1f9d8b	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	General Site Laborer	2026-04-01	\N	Active	2026-09-04 08:48:35.076051+05:30	2026-09-04 08:48:35.076052+05:30
dfab3298-2acb-4b25-a4fb-b5dbfd6eee1f	80d32d31-1af9-4cba-9a4a-afe6642c01ce	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Structural Masonry & Steel	2026-04-01	2026-01-01	Completed	2026-09-04 08:48:35.075983+05:30	2026-09-04 08:48:36.031606+05:30
d6b1a281-3609-4c15-83cc-8a567ca4b9f8	80d32d31-1af9-4cba-9a4a-afe6642c01ce	35f2b6aa-edb9-4c59-a1b5-b280819af623	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Foundation Masonry	2026-01-01	2026-04-01	Transferred	2026-09-04 08:48:36.03413+05:30	2026-09-04 08:48:36.078774+05:30
07b43dd4-112a-4430-850c-5692a37858ef	80d32d31-1af9-4cba-9a4a-afe6642c01ce	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Structural Steel	2026-04-01	2026-01-01	Completed	2026-09-04 08:48:36.080114+05:30	2026-09-04 09:25:58.221189+05:30
8003c43c-e88c-4118-a779-9e980a31ac3b	80d32d31-1af9-4cba-9a4a-afe6642c01ce	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Foundation Masonry	2026-01-01	2026-04-01	Transferred	2026-09-04 09:25:58.221962+05:30	2026-09-04 09:25:58.235906+05:30
a40d44f6-cb1f-4de7-84f8-d4c55ddc0c57	80d32d31-1af9-4cba-9a4a-afe6642c01ce	06b8d242-5554-4575-b786-2e0a243354bc	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	Structural Steel	2026-04-01	\N	Active	2026-09-04 09:25:58.236602+05:30	2026-09-04 09:25:58.236606+05:30
\.


--
-- Data for Name: worker_shift_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_shift_assignments (id, shift_id, worker_id, assigned_at) FROM stdin;
3af8560f-cfac-490e-8007-1c793de7c573	2da071ba-a14c-4405-b128-4b115d01a522	80d32d31-1af9-4cba-9a4a-afe6642c01ce	2026-09-04 08:48:36.17651+05:30
0b45a38c-27e4-44bd-a933-79ae58007372	c94c3902-a7a1-4c38-91f3-b56f57171672	80d32d31-1af9-4cba-9a4a-afe6642c01ce	2026-09-04 09:25:58.267748+05:30
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workers (id, worker_id, worker_name, contact_information, workforce_category_id, skill_or_work_type, contractor_id, joining_date, worker_status, pay_rate, created_at, updated_at) FROM stdin;
80d32d31-1af9-4cba-9a4a-afe6642c01ce	WRK-2026-001	Robert Thorne	+1 555-0181	186ff493-b29c-472e-867b-89daa04b276f	Structural Masonry & Steel	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-01-10	Active	650	2026-09-04 08:48:35.058807+05:30	2026-09-04 08:48:35.058814+05:30
a53e63a4-5e2b-4d5e-9232-e250129bf137	WRK-2026-002	Carlos Mendez	+1 555-0182	186ff493-b29c-472e-867b-89daa04b276f	Concrete Pouring & Formwork	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-01-15	Active	600	2026-09-04 08:48:35.058832+05:30	2026-09-04 08:48:35.058834+05:30
dcb45e4e-57bd-4c09-abe7-18e67cd1a5d1	WRK-2026-003	Maria Gonzalez	+1 555-0183	a2ac6c4b-1fed-4992-9c26-e996750c96c6	Site Safety & Crew Inspection	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-02-01	Active	850	2026-09-04 08:48:35.058843+05:30	2026-09-04 08:48:35.058845+05:30
f089edf6-f3f7-47ae-88c2-7d92aac8ca8a	WRK-2026-004	David Vance	+1 555-0184	752880bf-bbc6-4ef3-a0a1-5823a3ad8ac4	Structural Design Engineer	\N	2026-02-10	Active	1200	2026-09-04 08:48:35.058853+05:30	2026-09-04 08:48:35.058854+05:30
54b42442-9fa7-48f8-991c-96d14dcf9b0d	WRK-2026-005	James Watson	+1 555-0185	186ff493-b29c-472e-867b-89daa04b276f	Tower Crane Operator	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-03-01	Active	750	2026-09-04 08:48:35.058865+05:30	2026-09-04 08:48:35.058867+05:30
f064237f-99fb-4f69-9c95-40fbae1f9d8b	WRK-2026-006	Anita Roy	+1 555-0186	3fa7a336-668f-4393-b7ff-f0fd470bf6d0	General Site Laborer	8f7c4f71-98e1-4d01-9d76-8405f4a9f88c	2026-03-15	Active	400	2026-09-04 08:48:35.058875+05:30	2026-09-04 08:48:35.058876+05:30
77a60db4-4fac-452c-ad5c-c092240b8466	WRK-TEST-999	Test Mason Worker	+1 555-9999	186ff493-b29c-472e-867b-89daa04b276f	Structural Masonry	\N	2026-08-01	On Leave	700	2026-09-04 09:25:58.135743+05:30	2026-09-04 09:25:58.177887+05:30
390983e3-b800-4682-9f22-b928844e9ce0	WRK-BULK-001	Bulk Carpenter	\N	186ff493-b29c-472e-867b-89daa04b276f	Carpentry	\N	2026-08-01	Active	650	2026-09-04 09:25:58.199809+05:30	2026-09-04 09:25:58.199811+05:30
11c6748c-9059-4f14-a742-e1d88b42020b	WRK-BULK-002	Bulk Plumber	\N	186ff493-b29c-472e-867b-89daa04b276f	Plumbing	\N	2026-08-01	Active	600	2026-09-04 09:25:58.204614+05:30	2026-09-04 09:25:58.204616+05:30
\.


--
-- Data for Name: workforce_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workforce_categories (id, name, description, created_at) FROM stdin;
752880bf-bbc6-4ef3-a0a1-5823a3ad8ac4	Engineers	Civil, Structural, Electrical, and Mechanical Engineering Personnel	2026-09-04 08:48:35.019795+05:30
a2ac6c4b-1fed-4992-9c26-e996750c96c6	Supervisors	Field Site Supervisors, Foreman, and Safety Inspectors	2026-09-04 08:48:35.019817+05:30
9339d9d6-9120-4e67-8ff1-371d6bab2ec9	Contractors	Subcontractors and Specialized Trade Management Personnel	2026-09-04 08:48:35.019825+05:30
186ff493-b29c-472e-867b-89daa04b276f	Skilled Workers	Masons, Electricians, Plumbers, Carpenters, Welders, Machine Operators	2026-09-04 08:48:35.019833+05:30
3fa7a336-668f-4393-b7ff-f0fd470bf6d0	Unskilled Workers	General Construction Laborers, Helpers, and Excavation Support	2026-09-04 08:48:35.019841+05:30
428a30c4-6184-45c1-ad0e-bf8c2d5800d0	Consultants	Architectural, Environmental, and Structural Quality Consultants	2026-09-04 08:48:35.019848+05:30
\.


--
-- Data for Name: workforce_payrolls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workforce_payrolls (id, worker_id, project_id, pay_period_start, pay_period_end, pay_rate, working_days, working_hours, overtime_hours, leave_days, attendance_reference, estimated_pay, payroll_status, created_at, updated_at) FROM stdin;
f860904a-255a-4832-85b9-0b94ed080d32	80d32d31-1af9-4cba-9a4a-afe6642c01ce	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-01	2026-08-07	650	6	48	4	0	Weekly auto-calculated attendance	4387.5	Approved	2026-09-04 08:48:35.124887+05:30	2026-09-04 08:48:35.124894+05:30
c852b30b-0253-4434-82fc-87530831d605	a53e63a4-5e2b-4d5e-9232-e250129bf137	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-01	2026-08-07	600	6	48	4	0	Weekly auto-calculated attendance	4050	Approved	2026-09-04 08:48:35.124911+05:30	2026-09-04 08:48:35.124913+05:30
441506d4-f7c9-4585-a364-3bcb207004e1	dcb45e4e-57bd-4c09-abe7-18e67cd1a5d1	06b8d242-5554-4575-b786-2e0a243354bc	2026-08-01	2026-08-07	850	6	48	4	0	Weekly auto-calculated attendance	5737.5	Approved	2026-09-04 08:48:35.124923+05:30	2026-09-04 08:48:35.124924+05:30
900d161d-535b-41b1-9321-a9fc403e9ffa	80d32d31-1af9-4cba-9a4a-afe6642c01ce	35f2b6aa-edb9-4c59-a1b5-b280819af623	2026-08-01	2026-08-07	600	6	48	4	0	Calculated from attendance period 2026-08-01 to 2026-08-07	4050	Approved	2026-09-04 08:48:36.359319+05:30	2026-09-04 08:48:36.405629+05:30
cedb494e-6f79-4d8b-964c-634f71b4de91	80d32d31-1af9-4cba-9a4a-afe6642c01ce	ea9f4a2e-7d80-4dc0-a990-f7b32bfc4a56	2026-08-01	2026-08-07	600	6	48	4	0	Calculated from attendance period 2026-08-01 to 2026-08-07	4050	Approved	2026-09-04 09:25:58.320738+05:30	2026-09-04 09:25:58.335972+05:30
\.


--
-- Name: actual_expenses actual_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actual_expenses
    ADD CONSTRAINT actual_expenses_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: assigned_tasks assigned_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_tasks
    ADD CONSTRAINT assigned_tasks_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: budget_category_allocations budget_category_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_category_allocations
    ADD CONSTRAINT budget_category_allocations_pkey PRIMARY KEY (id);


--
-- Name: contractor_workers contractor_workers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contractor_workers
    ADD CONSTRAINT contractor_workers_pkey PRIMARY KEY (id);


--
-- Name: cost_estimates cost_estimates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_estimates
    ADD CONSTRAINT cost_estimates_pkey PRIMARY KEY (id);


--
-- Name: daily_activity_logs daily_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_activity_logs
    ADD CONSTRAINT daily_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: daily_progress_reports daily_progress_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_progress_reports
    ADD CONSTRAINT daily_progress_reports_pkey PRIMARY KEY (id);


--
-- Name: delay_tracking delay_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delay_tracking
    ADD CONSTRAINT delay_tracking_pkey PRIMARY KEY (id);


--
-- Name: equipment_status equipment_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_status
    ADD CONSTRAINT equipment_status_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: material_allocations material_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_pkey PRIMARY KEY (id);


--
-- Name: material_categories material_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_categories
    ADD CONSTRAINT material_categories_name_key UNIQUE (name);


--
-- Name: material_categories material_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_categories
    ADD CONSTRAINT material_categories_pkey PRIMARY KEY (id);


--
-- Name: material_inventories material_inventories_material_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_inventories
    ADD CONSTRAINT material_inventories_material_id_key UNIQUE (material_id);


--
-- Name: material_inventories material_inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_inventories
    ADD CONSTRAINT material_inventories_pkey PRIMARY KEY (id);


--
-- Name: material_requests material_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: procurement_categories procurement_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_categories
    ADD CONSTRAINT procurement_categories_pkey PRIMARY KEY (id);


--
-- Name: procurement_request_items procurement_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_request_items
    ADD CONSTRAINT procurement_request_items_pkey PRIMARY KEY (id);


--
-- Name: procurement_requests procurement_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_requests
    ADD CONSTRAINT procurement_requests_pkey PRIMARY KEY (id);


--
-- Name: procurements procurements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurements
    ADD CONSTRAINT procurements_pkey PRIMARY KEY (id);


--
-- Name: progress_photographs progress_photographs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_photographs
    ADD CONSTRAINT progress_photographs_pkey PRIMARY KEY (id);


--
-- Name: project_audit_logs project_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_audit_logs
    ADD CONSTRAINT project_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: project_budgets project_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_pkey PRIMARY KEY (id);


--
-- Name: project_clients project_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_clients
    ADD CONSTRAINT project_clients_pkey PRIMARY KEY (id);


--
-- Name: project_contractors project_contractors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contractors
    ADD CONSTRAINT project_contractors_pkey PRIMARY KEY (id);


--
-- Name: project_documents project_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_pkey PRIMARY KEY (id);


--
-- Name: project_milestones project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);


--
-- Name: project_schedules project_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_schedules
    ADD CONSTRAINT project_schedules_pkey PRIMARY KEY (id);


--
-- Name: project_site_engineers project_site_engineers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_engineers
    ADD CONSTRAINT project_site_engineers_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: resource_allocations resource_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_pkey PRIMARY KEY (id);


--
-- Name: resource_maintenances resource_maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_maintenances
    ADD CONSTRAINT resource_maintenances_pkey PRIMARY KEY (id);


--
-- Name: resource_utilizations resource_utilizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_utilizations
    ADD CONSTRAINT resource_utilizations_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: site_activity_logs site_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_activity_logs
    ADD CONSTRAINT site_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: budget_category_allocations uq_budget_category; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_category_allocations
    ADD CONSTRAINT uq_budget_category UNIQUE (budget_id, category);


--
-- Name: project_clients uq_project_client; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_clients
    ADD CONSTRAINT uq_project_client UNIQUE (project_id, client_id);


--
-- Name: project_contractors uq_project_contractor; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contractors
    ADD CONSTRAINT uq_project_contractor UNIQUE (project_id, contractor_id);


--
-- Name: project_site_engineers uq_project_site_engineer; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_engineers
    ADD CONSTRAINT uq_project_site_engineer UNIQUE (project_id, site_engineer_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: weekly_progress_reports weekly_progress_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_progress_reports
    ADD CONSTRAINT weekly_progress_reports_pkey PRIMARY KEY (id);


--
-- Name: work_completion_status work_completion_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_completion_status
    ADD CONSTRAINT work_completion_status_pkey PRIMARY KEY (id);


--
-- Name: work_completion_status work_completion_status_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_completion_status
    ADD CONSTRAINT work_completion_status_project_id_key UNIQUE (project_id);


--
-- Name: worker_project_assignments worker_project_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_project_assignments
    ADD CONSTRAINT worker_project_assignments_pkey PRIMARY KEY (id);


--
-- Name: worker_shift_assignments worker_shift_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_shift_assignments
    ADD CONSTRAINT worker_shift_assignments_pkey PRIMARY KEY (id);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: workforce_categories workforce_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workforce_categories
    ADD CONSTRAINT workforce_categories_pkey PRIMARY KEY (id);


--
-- Name: workforce_payrolls workforce_payrolls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workforce_payrolls
    ADD CONSTRAINT workforce_payrolls_pkey PRIMARY KEY (id);


--
-- Name: idx_notifications_user_unread_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_unread_created ON public.notifications USING btree (user_id, is_read, created_at);


--
-- Name: ix_actual_expenses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_category ON public.actual_expenses USING btree (category);


--
-- Name: ix_actual_expenses_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_equipment_id ON public.actual_expenses USING btree (equipment_id);


--
-- Name: ix_actual_expenses_expense_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_actual_expenses_expense_code ON public.actual_expenses USING btree (expense_code);


--
-- Name: ix_actual_expenses_expense_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_expense_date ON public.actual_expenses USING btree (expense_date);


--
-- Name: ix_actual_expenses_material_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_material_id ON public.actual_expenses USING btree (material_id);


--
-- Name: ix_actual_expenses_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_project_id ON public.actual_expenses USING btree (project_id);


--
-- Name: ix_actual_expenses_purchase_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_purchase_order_id ON public.actual_expenses USING btree (purchase_order_id);


--
-- Name: ix_actual_expenses_worker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_actual_expenses_worker_id ON public.actual_expenses USING btree (worker_id);


--
-- Name: ix_attendance_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_attendance_date ON public.attendance USING btree (date);


--
-- Name: ix_attendance_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_attendance_project_id ON public.attendance USING btree (project_id);


--
-- Name: ix_attendance_shift_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_attendance_shift_id ON public.attendance USING btree (shift_id);


--
-- Name: ix_attendance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_attendance_status ON public.attendance USING btree (status);


--
-- Name: ix_attendance_worker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_attendance_worker_id ON public.attendance USING btree (worker_id);


--
-- Name: ix_budget_category_allocations_budget_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_budget_category_allocations_budget_id ON public.budget_category_allocations USING btree (budget_id);


--
-- Name: ix_budget_category_allocations_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_budget_category_allocations_category ON public.budget_category_allocations USING btree (category);


--
-- Name: ix_cost_estimates_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cost_estimates_category ON public.cost_estimates USING btree (category);


--
-- Name: ix_cost_estimates_estimate_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_cost_estimates_estimate_code ON public.cost_estimates USING btree (estimate_code);


--
-- Name: ix_cost_estimates_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cost_estimates_project_id ON public.cost_estimates USING btree (project_id);


--
-- Name: ix_invoices_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_due_date ON public.invoices USING btree (due_date);


--
-- Name: ix_invoices_invoice_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_invoice_date ON public.invoices USING btree (invoice_date);


--
-- Name: ix_invoices_invoice_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_invoices_invoice_id ON public.invoices USING btree (invoice_id);


--
-- Name: ix_invoices_invoice_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_invoice_number ON public.invoices USING btree (invoice_number);


--
-- Name: ix_invoices_invoice_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_invoice_status ON public.invoices USING btree (invoice_status);


--
-- Name: ix_invoices_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_payment_status ON public.invoices USING btree (payment_status);


--
-- Name: ix_invoices_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_project_id ON public.invoices USING btree (project_id);


--
-- Name: ix_invoices_purchase_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_purchase_order_id ON public.invoices USING btree (purchase_order_id);


--
-- Name: ix_invoices_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_vendor_id ON public.invoices USING btree (vendor_id);


--
-- Name: ix_material_requests_request_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_material_requests_request_code ON public.material_requests USING btree (request_code);


--
-- Name: ix_materials_material_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_materials_material_code ON public.materials USING btree (material_code);


--
-- Name: ix_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: ix_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: ix_notifications_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_project_id ON public.notifications USING btree (project_id);


--
-- Name: ix_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_type ON public.notifications USING btree (type);


--
-- Name: ix_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: ix_procurement_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_procurement_categories_name ON public.procurement_categories USING btree (name);


--
-- Name: ix_procurement_requests_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_procurement_requests_project_id ON public.procurement_requests USING btree (project_id);


--
-- Name: ix_procurement_requests_request_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_procurement_requests_request_date ON public.procurement_requests USING btree (request_date);


--
-- Name: ix_procurement_requests_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_procurement_requests_request_id ON public.procurement_requests USING btree (request_id);


--
-- Name: ix_procurement_requests_request_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_procurement_requests_request_status ON public.procurement_requests USING btree (request_status);


--
-- Name: ix_project_budgets_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_project_budgets_project_id ON public.project_budgets USING btree (project_id);


--
-- Name: ix_projects_project_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_projects_project_code ON public.projects USING btree (project_code);


--
-- Name: ix_purchase_orders_order_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchase_orders_order_date ON public.purchase_orders USING btree (order_date);


--
-- Name: ix_purchase_orders_procurement_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchase_orders_procurement_request_id ON public.purchase_orders USING btree (procurement_request_id);


--
-- Name: ix_purchase_orders_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchase_orders_project_id ON public.purchase_orders USING btree (project_id);


--
-- Name: ix_purchase_orders_purchase_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_purchase_orders_purchase_order_id ON public.purchase_orders USING btree (purchase_order_id);


--
-- Name: ix_purchase_orders_purchase_order_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchase_orders_purchase_order_status ON public.purchase_orders USING btree (purchase_order_status);


--
-- Name: ix_purchase_orders_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchase_orders_vendor_id ON public.purchase_orders USING btree (vendor_id);


--
-- Name: ix_resources_equipment_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_resources_equipment_code ON public.resources USING btree (equipment_code);


--
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- Name: ix_shifts_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_shifts_project_id ON public.shifts USING btree (project_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_employee_id ON public.users USING btree (employee_id);


--
-- Name: ix_vendors_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_vendors_vendor_id ON public.vendors USING btree (vendor_id);


--
-- Name: ix_vendors_vendor_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vendors_vendor_name ON public.vendors USING btree (vendor_name);


--
-- Name: ix_vendors_vendor_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vendors_vendor_status ON public.vendors USING btree (vendor_status);


--
-- Name: ix_worker_project_assignments_assignment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_worker_project_assignments_assignment_status ON public.worker_project_assignments USING btree (assignment_status);


--
-- Name: ix_worker_project_assignments_contractor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_worker_project_assignments_contractor_id ON public.worker_project_assignments USING btree (contractor_id);


--
-- Name: ix_worker_project_assignments_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_worker_project_assignments_project_id ON public.worker_project_assignments USING btree (project_id);


--
-- Name: ix_worker_project_assignments_worker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_worker_project_assignments_worker_id ON public.worker_project_assignments USING btree (worker_id);


--
-- Name: ix_worker_shift_assignments_shift_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_worker_shift_assignments_shift_id ON public.worker_shift_assignments USING btree (shift_id);


--
-- Name: ix_worker_shift_assignments_worker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_worker_shift_assignments_worker_id ON public.worker_shift_assignments USING btree (worker_id);


--
-- Name: ix_workers_contractor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workers_contractor_id ON public.workers USING btree (contractor_id);


--
-- Name: ix_workers_skill_or_work_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workers_skill_or_work_type ON public.workers USING btree (skill_or_work_type);


--
-- Name: ix_workers_worker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_workers_worker_id ON public.workers USING btree (worker_id);


--
-- Name: ix_workers_worker_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workers_worker_name ON public.workers USING btree (worker_name);


--
-- Name: ix_workers_worker_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workers_worker_status ON public.workers USING btree (worker_status);


--
-- Name: ix_workers_workforce_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workers_workforce_category_id ON public.workers USING btree (workforce_category_id);


--
-- Name: ix_workforce_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_workforce_categories_name ON public.workforce_categories USING btree (name);


--
-- Name: ix_workforce_payrolls_payroll_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workforce_payrolls_payroll_status ON public.workforce_payrolls USING btree (payroll_status);


--
-- Name: ix_workforce_payrolls_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workforce_payrolls_project_id ON public.workforce_payrolls USING btree (project_id);


--
-- Name: ix_workforce_payrolls_worker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_workforce_payrolls_worker_id ON public.workforce_payrolls USING btree (worker_id);


--
-- Name: actual_expenses actual_expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actual_expenses
    ADD CONSTRAINT actual_expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: actual_expenses actual_expenses_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actual_expenses
    ADD CONSTRAINT actual_expenses_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE SET NULL;


--
-- Name: actual_expenses actual_expenses_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actual_expenses
    ADD CONSTRAINT actual_expenses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: attendance attendance_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE SET NULL;


--
-- Name: attendance attendance_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: budget_category_allocations budget_category_allocations_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_category_allocations
    ADD CONSTRAINT budget_category_allocations_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.project_budgets(id) ON DELETE CASCADE;


--
-- Name: contractor_workers contractor_workers_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contractor_workers
    ADD CONSTRAINT contractor_workers_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contractor_workers contractor_workers_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contractor_workers
    ADD CONSTRAINT contractor_workers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: contractor_workers contractor_workers_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contractor_workers
    ADD CONSTRAINT contractor_workers_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cost_estimates cost_estimates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_estimates
    ADD CONSTRAINT cost_estimates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cost_estimates cost_estimates_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_estimates
    ADD CONSTRAINT cost_estimates_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: daily_progress_reports daily_progress_reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_progress_reports
    ADD CONSTRAINT daily_progress_reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: daily_progress_reports daily_progress_reports_reported_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_progress_reports
    ADD CONSTRAINT daily_progress_reports_reported_by_id_fkey FOREIGN KEY (reported_by_id) REFERENCES public.users(id);


--
-- Name: delay_tracking delay_tracking_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delay_tracking
    ADD CONSTRAINT delay_tracking_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE RESTRICT;


--
-- Name: material_allocations material_allocations_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_allocations material_allocations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: material_allocations material_allocations_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.material_requests(id) ON DELETE SET NULL;


--
-- Name: material_allocations material_allocations_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_allocations
    ADD CONSTRAINT material_allocations_responsible_user_id_fkey FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: material_inventories material_inventories_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_inventories
    ADD CONSTRAINT material_inventories_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_requests material_requests_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_requests material_requests_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: material_requests material_requests_requested_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: materials materials_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.material_categories(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: procurement_request_items procurement_request_items_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_request_items
    ADD CONSTRAINT procurement_request_items_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE SET NULL;


--
-- Name: procurement_request_items procurement_request_items_procurement_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_request_items
    ADD CONSTRAINT procurement_request_items_procurement_request_id_fkey FOREIGN KEY (procurement_request_id) REFERENCES public.procurement_requests(id) ON DELETE CASCADE;


--
-- Name: procurement_requests procurement_requests_approved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_requests
    ADD CONSTRAINT procurement_requests_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurement_requests procurement_requests_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_requests
    ADD CONSTRAINT procurement_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: procurement_requests procurement_requests_rejected_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_requests
    ADD CONSTRAINT procurement_requests_rejected_by_id_fkey FOREIGN KEY (rejected_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: procurement_requests procurement_requests_requested_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procurement_requests
    ADD CONSTRAINT procurement_requests_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: progress_photographs progress_photographs_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_photographs
    ADD CONSTRAINT progress_photographs_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.daily_progress_reports(id) ON DELETE CASCADE;


--
-- Name: project_audit_logs project_audit_logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_audit_logs
    ADD CONSTRAINT project_audit_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: project_audit_logs project_audit_logs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_audit_logs
    ADD CONSTRAINT project_audit_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_budgets project_budgets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: project_budgets project_budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_clients project_clients_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_clients
    ADD CONSTRAINT project_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_clients project_clients_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_clients
    ADD CONSTRAINT project_clients_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_contractors project_contractors_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contractors
    ADD CONSTRAINT project_contractors_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_contractors project_contractors_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_contractors
    ADD CONSTRAINT project_contractors_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_milestones project_milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_schedules project_schedules_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_schedules
    ADD CONSTRAINT project_schedules_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_site_engineers project_site_engineers_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_engineers
    ADD CONSTRAINT project_site_engineers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_site_engineers project_site_engineers_site_engineer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_engineers
    ADD CONSTRAINT project_site_engineers_site_engineer_id_fkey FOREIGN KEY (site_engineer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: projects projects_project_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES public.users(id);


--
-- Name: purchase_order_items purchase_order_items_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_approved_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_id_fkey FOREIGN KEY (approved_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_procurement_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_procurement_request_id_fkey FOREIGN KEY (procurement_request_id) REFERENCES public.procurement_requests(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE RESTRICT;


--
-- Name: resource_allocations resource_allocations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: resource_allocations resource_allocations_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: resource_allocations resource_allocations_responsible_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_responsible_person_id_fkey FOREIGN KEY (responsible_person_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: resource_maintenances resource_maintenances_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_maintenances
    ADD CONSTRAINT resource_maintenances_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: resource_utilizations resource_utilizations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_utilizations
    ADD CONSTRAINT resource_utilizations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: resource_utilizations resource_utilizations_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_utilizations
    ADD CONSTRAINT resource_utilizations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: resources resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: resources resources_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: resources resources_responsible_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_responsible_person_id_fkey FOREIGN KEY (responsible_person_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shifts shifts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: site_activity_logs site_activity_logs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_activity_logs
    ADD CONSTRAINT site_activity_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: weekly_progress_reports weekly_progress_reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_progress_reports
    ADD CONSTRAINT weekly_progress_reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: work_completion_status work_completion_status_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_completion_status
    ADD CONSTRAINT work_completion_status_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: worker_project_assignments worker_project_assignments_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_project_assignments
    ADD CONSTRAINT worker_project_assignments_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: worker_project_assignments worker_project_assignments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_project_assignments
    ADD CONSTRAINT worker_project_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: worker_project_assignments worker_project_assignments_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_project_assignments
    ADD CONSTRAINT worker_project_assignments_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: worker_shift_assignments worker_shift_assignments_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_shift_assignments
    ADD CONSTRAINT worker_shift_assignments_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE CASCADE;


--
-- Name: worker_shift_assignments worker_shift_assignments_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_shift_assignments
    ADD CONSTRAINT worker_shift_assignments_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: workers workers_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: workers workers_workforce_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_workforce_category_id_fkey FOREIGN KEY (workforce_category_id) REFERENCES public.workforce_categories(id) ON DELETE RESTRICT;


--
-- Name: workforce_payrolls workforce_payrolls_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workforce_payrolls
    ADD CONSTRAINT workforce_payrolls_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: workforce_payrolls workforce_payrolls_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workforce_payrolls
    ADD CONSTRAINT workforce_payrolls_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict W7Np43lsBXe7eQ6zPL4X0HAkCt5kOuYjv4hAer2kuz9PVb5e9f8WM44l1tWRo3l

