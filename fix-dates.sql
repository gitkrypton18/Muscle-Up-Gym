-- =========================================================================
-- FIX DUMMY DATA DATES SCRIPT
-- Run this in your Supabase SQL Editor to fix the date calculations
-- =========================================================================

-- Fix the end dates based on the start date and plan name
UPDATE public.memberships 
SET end_date = start_date + (CASE 
  WHEN plan_name LIKE '%Monthly%' THEN interval '30 days'
  WHEN plan_name LIKE '%Quarterly%' THEN interval '90 days'
  WHEN plan_name LIKE '%Half-Yearly%' THEN interval '180 days'
  WHEN plan_name LIKE '%Annual%' THEN interval '365 days'
  WHEN plan_name LIKE '%Student%' THEN interval '30 days'
  ELSE interval '30 days'
END);

-- Re-sync the membership statuses so they perfectly match the dates
UPDATE public.memberships
SET status = CASE 
  WHEN end_date < NOW() THEN 'expired'
  ELSE 'active'
END;
