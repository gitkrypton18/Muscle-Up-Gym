-- ==========================================
-- INJECT 50 DIVERSE CUSTOMERS, MEMBERSHIPS & PAYMENTS
-- Edge cases included: Unpaid, partially paid, expired, expiring soon
-- ==========================================

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('a436ff50-1298-41bf-abcf-6e5a1461b6e2', 'Atharv Tiwari', '9511709953', 'Male', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('fc679357-8d82-460e-8463-47a7f5a746bc', 'a436ff50-1298-41bf-abcf-6e5a1461b6e2', 'Couple Monthly', 2500, '2026-06-15', '2026-07-15', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('fc679357-8d82-460e-8463-47a7f5a746bc', 2500, 2500, 'UPI', '2026-06-15');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('2aff830a-0257-4385-9eff-8a7f5203bea2', 'Anita Rajput', '9635435917', 'Male', 'A+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('46ebc0df-08a5-4119-aad0-32bae08fa3fe', '2aff830a-0257-4385-9eff-8a7f5203bea2', 'Couple Monthly', 2500, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('46ebc0df-08a5-4119-aad0-32bae08fa3fe', 2500, 1250, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('afde0d24-c38d-4145-a062-720fcb850d97', 'Kabir Agarwal', '9948281420', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('d25b121f-0875-483a-9f4c-1d9e5cb9b6b9', 'afde0d24-c38d-4145-a062-720fcb850d97', 'Student Special', 1200, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('d25b121f-0875-483a-9f4c-1d9e5cb9b6b9', 1200, 0, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('10b02f3e-f91e-4156-9462-947475019181', 'Aarav Sharma', '9986217972', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('6206baaa-fde9-4eb3-85d5-69269e8d667e', '10b02f3e-f91e-4156-9462-947475019181', 'Quarterly Pro', 4000, '2026-03-26', '2026-09-24', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('6206baaa-fde9-4eb3-85d5-69269e8d667e', 4000, 0, 'UPI', '2026-03-26');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('7dde8328-03f4-42c0-939e-ff702a953384', 'Ayaan Agarwal', '9944830214', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('0b7969aa-1c04-43e6-8ddf-401e7341487b', '7dde8328-03f4-42c0-939e-ff702a953384', 'Half-Yearly Elite', 7500, '2026-06-11', '2026-12-08', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('0b7969aa-1c04-43e6-8ddf-401e7341487b', 7500, 7500, 'UPI', '2026-06-11');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('8fc0c975-a996-4635-8a72-23671820e143', 'Anita Sharma', '9089833482', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('886eb96d-252c-417c-b7af-d22412f4ad4e', '8fc0c975-a996-4635-8a72-23671820e143', 'Monthly Basic', 1500, '2026-06-19', '2026-07-19', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('886eb96d-252c-417c-b7af-d22412f4ad4e', 1500, 0, 'UPI', '2026-06-19');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('170823e3-6746-4f27-a894-0befab0467ee', 'Sai Nagar', '9388653941', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('6d2825d4-a237-42b8-9f15-df108d4e8221', '170823e3-6746-4f27-a894-0befab0467ee', 'Quarterly Pro', 4000, '2026-06-15', '2026-09-13', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('6d2825d4-a237-42b8-9f15-df108d4e8221', 4000, 1530, 'UPI', '2026-06-15');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('6a462df2-6a33-4863-b196-d5e8410b838e', 'Anita Bhatia', '9562143865', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('c56dbd9f-b6d5-426d-a7ca-d662f490f33a', '6a462df2-6a33-4863-b196-d5e8410b838e', 'Student Special', 1200, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('c56dbd9f-b6d5-426d-a7ca-d662f490f33a', 1200, 1200, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('d87f4d18-0f46-4459-bf46-a98aed3c4cd6', 'Aarush Choudhary', '9085774539', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('5a0174e0-199f-4db1-b0b1-a66b1c0689ae', 'd87f4d18-0f46-4459-bf46-a98aed3c4cd6', 'Quarterly Pro', 4000, '2026-06-11', '2026-09-09', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('5a0174e0-199f-4db1-b0b1-a66b1c0689ae', 4000, 1263, 'UPI', '2026-06-11');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('9896f8ab-7df0-4b4a-8625-ca3c94d742f0', 'Rudra Yadav', '9552663959', 'Male', 'A+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('161b4815-c10f-4e7c-8c7c-4ffbc1240305', '9896f8ab-7df0-4b4a-8625-ca3c94d742f0', 'Annual Champion', 12000, '2025-06-24', '2027-06-24', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('161b4815-c10f-4e7c-8c7c-4ffbc1240305', 12000, 0, 'UPI', '2025-06-24');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('8afa839f-b0bf-4443-990d-43a6b64d5144', 'Divya Nagar', '9279489195', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('c2d62191-d7bd-4509-a969-a3add03d0c5c', '8afa839f-b0bf-4443-990d-43a6b64d5144', 'Quarterly Pro', 4000, '2026-06-21', '2026-09-19', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('c2d62191-d7bd-4509-a969-a3add03d0c5c', 4000, 4000, 'UPI', '2026-06-21');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('868c3bc4-5edc-490b-8226-11f29383a2a9', 'Divya Sharma', '9186020707', 'Female', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('381735c9-7fd7-4dea-bbbe-600f1ef19af1', '868c3bc4-5edc-490b-8226-11f29383a2a9', 'Monthly Basic', 1500, '2026-05-25', '2026-07-25', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('381735c9-7fd7-4dea-bbbe-600f1ef19af1', 1500, 1500, 'UPI', '2026-05-25');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('8bedc2df-6a62-4c67-a3eb-dd6ee2766080', 'Priyanka Yadav', '9749297247', 'Female', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('6e1432c2-026f-40c9-884e-7611449112f2', '8bedc2df-6a62-4c67-a3eb-dd6ee2766080', 'Quarterly Pro', 4000, '2026-03-13', '2026-09-11', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('6e1432c2-026f-40c9-884e-7611449112f2', 4000, 4000, 'UPI', '2026-03-13');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('2795a016-f5c4-4a82-8130-cd86db188308', 'Shruti Mishra', '9493107967', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('fb2a548a-841b-45c7-afaa-ed94de2520ac', '2795a016-f5c4-4a82-8130-cd86db188308', 'Quarterly Pro', 4000, '2026-06-16', '2026-09-14', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('fb2a548a-841b-45c7-afaa-ed94de2520ac', 4000, 4000, 'UPI', '2026-06-16');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('59f250b4-e5aa-47ce-857a-30f7fb72ba5b', 'Rahul Mishra', '9159981166', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('c7e09d30-ab7d-4446-9789-c5a2db961e8e', '59f250b4-e5aa-47ce-857a-30f7fb72ba5b', 'Monthly Basic', 1500, '2026-06-21', '2026-07-21', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('c7e09d30-ab7d-4446-9789-c5a2db961e8e', 1500, 0, 'UPI', '2026-06-21');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('5fd12cee-8ac0-47f7-9b81-6cf74b4187c6', 'Shaurya Kumar', '9348784701', 'Female', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('f58d6a2a-4d79-4abc-8c99-0d1d38938935', '5fd12cee-8ac0-47f7-9b81-6cf74b4187c6', 'Annual Champion', 12000, '2026-06-12', '2027-06-12', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('f58d6a2a-4d79-4abc-8c99-0d1d38938935', 12000, 0, 'UPI', '2026-06-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('36968d44-de16-4140-89e3-7197675aff1e', 'Vihaan Rajput', '9405340165', 'Female', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('24d248bd-3908-41e7-b8d4-6c3737bba5c8', '36968d44-de16-4140-89e3-7197675aff1e', 'Quarterly Pro', 4000, '2026-06-13', '2026-09-11', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('24d248bd-3908-41e7-b8d4-6c3737bba5c8', 4000, 0, 'UPI', '2026-06-13');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('2580bec0-2f3b-490b-bf4b-78232165a9af', 'Aditya Mishra', '9382703374', 'Female', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('09018d8b-aeca-4871-9256-24c1667c355a', '2580bec0-2f3b-490b-bf4b-78232165a9af', 'Annual Champion', 12000, '2026-06-11', '2027-06-11', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('09018d8b-aeca-4871-9256-24c1667c355a', 12000, 12000, 'UPI', '2026-06-11');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('3add4deb-fe7d-4a5a-9d5e-f9c95ad4a6b0', 'Anjali Choudhary', '9252003604', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('a8f1f5cd-a273-4ab3-aee0-fc0e52936eb5', '3add4deb-fe7d-4a5a-9d5e-f9c95ad4a6b0', 'Half-Yearly Elite', 7500, '2026-06-13', '2026-12-10', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('a8f1f5cd-a273-4ab3-aee0-fc0e52936eb5', 7500, 7500, 'UPI', '2026-06-13');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('4b47251a-251d-4b3b-8290-35f2810647fe', 'Aarav Agarwal', '9921374132', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('f8b8bc83-91a5-48c8-976d-ebd88de5c0f6', '4b47251a-251d-4b3b-8290-35f2810647fe', 'Couple Monthly', 2500, '2026-05-25', '2026-07-25', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('f8b8bc83-91a5-48c8-976d-ebd88de5c0f6', 2500, 2500, 'UPI', '2026-05-25');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('e602d5d1-8a79-41f9-a727-55751f572f73', 'Ritvik Mehta', '9983026738', 'Female', 'A+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('3c39f194-3537-4989-8dee-adb0251c1183', 'e602d5d1-8a79-41f9-a727-55751f572f73', 'Quarterly Pro', 4000, '2026-03-26', '2026-09-24', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('3c39f194-3537-4989-8dee-adb0251c1183', 4000, 4000, 'UPI', '2026-03-26');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('0eaab739-bd24-45b3-80fd-ca29e62ec594', 'Vivaan Yadav', '9385721660', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('31c30881-4255-454e-baf9-49e5c1fed592', '0eaab739-bd24-45b3-80fd-ca29e62ec594', 'Student Special', 1200, '2026-06-15', '2026-07-15', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('31c30881-4255-454e-baf9-49e5c1fed592', 1200, 1200, 'UPI', '2026-06-15');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('166d9bd3-cdac-42c5-8f04-a706700ba065', 'Atharv Bhatia', '9773943814', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('4c2f5276-3ae3-4fe4-87da-a1602ddce9aa', '166d9bd3-cdac-42c5-8f04-a706700ba065', 'Half-Yearly Elite', 7500, '2025-12-13', '2026-12-10', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('4c2f5276-3ae3-4fe4-87da-a1602ddce9aa', 7500, 0, 'UPI', '2025-12-13');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('7cf15c97-aae5-4420-a96b-17aae43788f4', 'Sunita Verma', '9307465780', 'Male', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('4194392b-3452-4937-a729-019592933465', '7cf15c97-aae5-4420-a96b-17aae43788f4', 'Student Special', 1200, '2026-06-20', '2026-07-20', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('4194392b-3452-4937-a729-019592933465', 1200, 1200, 'UPI', '2026-06-20');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('86ace1ff-308b-4539-92d9-e82d60955832', 'Priyanka Rajput', '9823578897', 'Female', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('7ea87f61-35be-4a49-9329-7a059c8d09e6', '86ace1ff-308b-4539-92d9-e82d60955832', 'Half-Yearly Elite', 7500, '2026-06-21', '2026-12-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('7ea87f61-35be-4a49-9329-7a059c8d09e6', 7500, 7500, 'UPI', '2026-06-21');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('6834bcb1-dc7c-455e-8fa2-88259b02ee1e', 'Ayaan Sharma', '9065908694', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('3a46167b-0d1e-4351-99fb-ed51557a4b28', '6834bcb1-dc7c-455e-8fa2-88259b02ee1e', 'Monthly Basic', 1500, '2026-06-14', '2026-07-14', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('3a46167b-0d1e-4351-99fb-ed51557a4b28', 1500, 0, 'UPI', '2026-06-14');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('b7eb9a96-ed2e-4b14-9ad3-2946160bbc75', 'Rahul Bhatia', '9080583369', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('125a0c80-d05c-44f9-8392-b1a4cff59807', 'b7eb9a96-ed2e-4b14-9ad3-2946160bbc75', 'Quarterly Pro', 4000, '2026-03-26', '2026-09-24', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('125a0c80-d05c-44f9-8392-b1a4cff59807', 4000, 1236, 'UPI', '2026-03-26');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('0c85a7ba-b6a1-4b6e-a675-3731a53aabb0', 'Anita Mehta', '9708138118', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('4684c65d-8ba9-4aff-9cd7-46c73cfa73ee', '0c85a7ba-b6a1-4b6e-a675-3731a53aabb0', 'Monthly Basic', 1500, '2026-06-18', '2026-07-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('4684c65d-8ba9-4aff-9cd7-46c73cfa73ee', 1500, 1500, 'UPI', '2026-06-18');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('b8e695f7-8640-4926-a18a-1412388968be', 'Neha Joshi', '9348273875', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('2028b8ec-c52d-4bbf-aaa6-904923ce9e94', 'b8e695f7-8640-4926-a18a-1412388968be', 'Monthly Basic', 1500, '2026-05-25', '2026-07-25', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('2028b8ec-c52d-4bbf-aaa6-904923ce9e94', 1500, 1500, 'UPI', '2026-05-25');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('69d9a81b-a6b8-4e2a-9ced-fa15e5a55327', 'Rudra Singh', '9396467820', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('7ed49eb7-bd4f-464c-87cc-97b20b3241d2', '69d9a81b-a6b8-4e2a-9ced-fa15e5a55327', 'Couple Monthly', 2500, '2026-06-16', '2026-07-16', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('7ed49eb7-bd4f-464c-87cc-97b20b3241d2', 2500, 2500, 'UPI', '2026-06-16');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('1faa98d1-87db-411e-b548-1d85e3b66dbe', 'Krishna Choudhary', '9544599314', 'Male', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('01793bbe-c387-43b0-8aa6-c917dfe0d1fd', '1faa98d1-87db-411e-b548-1d85e3b66dbe', 'Quarterly Pro', 4000, '2026-06-20', '2026-09-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('01793bbe-c387-43b0-8aa6-c917dfe0d1fd', 4000, 0, 'UPI', '2026-06-20');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('d74db1b3-2645-4651-8ebf-2e41bf7af56d', 'Neha Agarwal', '9889260623', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('cf78f7d5-c6e6-45f0-a0a8-5b588a1ff9f4', 'd74db1b3-2645-4651-8ebf-2e41bf7af56d', 'Half-Yearly Elite', 7500, '2026-06-21', '2026-12-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('cf78f7d5-c6e6-45f0-a0a8-5b588a1ff9f4', 7500, 7292, 'UPI', '2026-06-21');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('047c8f9a-7d74-4944-a108-bddfbd2fd8aa', 'Preeti Sharma', '9826383251', 'Female', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('b4db4972-95f0-466f-8eb2-0dc0f98f35a5', '047c8f9a-7d74-4944-a108-bddfbd2fd8aa', 'Annual Champion', 12000, '2025-06-24', '2027-06-24', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('b4db4972-95f0-466f-8eb2-0dc0f98f35a5', 12000, 12000, 'UPI', '2025-06-24');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('da637d38-6770-4f3c-b29e-02ffed13586a', 'Divya Nagar', '9045951487', 'Male', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('a85d52a0-5980-4af5-8f27-8067063b8c85', 'da637d38-6770-4f3c-b29e-02ffed13586a', 'Couple Monthly', 2500, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('a85d52a0-5980-4af5-8f27-8067063b8c85', 2500, 2500, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('3670239e-71a8-45cc-be1b-9cb185f3cdb3', 'Ansh Sharma', '9973127906', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('dee202af-00df-45b6-a930-662289168a0a', '3670239e-71a8-45cc-be1b-9cb185f3cdb3', 'Quarterly Pro', 4000, '2026-06-20', '2026-09-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('dee202af-00df-45b6-a930-662289168a0a', 4000, 4000, 'UPI', '2026-06-20');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('065031cb-d32d-4690-bb1b-d01a2bc378ab', 'Meena Choudhary', '9332154927', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('c20b6e0a-b28f-4441-8bec-f783ca96f7cb', '065031cb-d32d-4690-bb1b-d01a2bc378ab', 'Monthly Basic', 1500, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('c20b6e0a-b28f-4441-8bec-f783ca96f7cb', 1500, 0, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('dae13a2b-10f3-410c-9f50-a3299a416dd7', 'Aarush Verma', '9423922907', 'Male', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('1ad4ad67-d3ac-4a3c-9663-5ba21f5e9428', 'dae13a2b-10f3-410c-9f50-a3299a416dd7', 'Student Special', 1200, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('1ad4ad67-d3ac-4a3c-9663-5ba21f5e9428', 1200, 561, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('b6ba40f5-9a26-447f-a8f3-7d4c30fa3874', 'Sneha Singh', '9919347053', 'Male', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('ff55836e-37aa-4a43-9c29-7d4959905eae', 'b6ba40f5-9a26-447f-a8f3-7d4c30fa3874', 'Couple Monthly', 2500, '2026-06-18', '2026-07-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('ff55836e-37aa-4a43-9c29-7d4959905eae', 2500, 2500, 'UPI', '2026-06-18');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('c3c9d5e4-248d-44f2-8400-7502099522ed', 'Pranav Agarwal', '9235426411', 'Male', 'B+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('3662a26d-01f7-469f-9108-a8d343b197ae', 'c3c9d5e4-248d-44f2-8400-7502099522ed', 'Couple Monthly', 2500, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('3662a26d-01f7-469f-9108-a8d343b197ae', 2500, 734, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('2ff6523c-7d45-4765-b2e9-7f51edae3c61', 'Ishaan Singh', '9726277800', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('188940dd-10e3-4d45-9551-fb370787f4f6', '2ff6523c-7d45-4765-b2e9-7f51edae3c61', 'Monthly Basic', 1500, '2026-06-20', '2026-07-20', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('188940dd-10e3-4d45-9551-fb370787f4f6', 1500, 949, 'UPI', '2026-06-20');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('1cf85c5f-779b-4822-9598-6460894787e8', 'Anita Mishra', '9491318027', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('dd0ae59a-4182-4d9c-be86-43bf4f74b850', '1cf85c5f-779b-4822-9598-6460894787e8', 'Quarterly Pro', 4000, '2026-06-20', '2026-09-18', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('dd0ae59a-4182-4d9c-be86-43bf4f74b850', 4000, 4000, 'UPI', '2026-06-20');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('e06d7d9e-f497-4171-be3f-bf57063043a4', 'Ayaan Jain', '9450647724', 'Female', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('70c9c8c7-350a-446d-8085-0efc016b425d', 'e06d7d9e-f497-4171-be3f-bf57063043a4', 'Student Special', 1200, '2026-06-14', '2026-07-14', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('70c9c8c7-350a-446d-8085-0efc016b425d', 1200, 1200, 'UPI', '2026-06-14');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('c6e74e0a-5927-4c4e-b6a0-99c0233eccb8', 'Anita Kumar', '9303337184', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('a834e5b8-fe12-4c34-a31b-01a0d391b972', 'c6e74e0a-5927-4c4e-b6a0-99c0233eccb8', 'Quarterly Pro', 4000, '2026-06-11', '2026-09-09', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('a834e5b8-fe12-4c34-a31b-01a0d391b972', 4000, 0, 'UPI', '2026-06-11');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('b5ba77fc-baec-452d-b02a-200faea97071', 'Aarav Nagar', '9778124708', 'Male', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('9089bf5b-12ed-4aad-b69a-160b63a9cf02', 'b5ba77fc-baec-452d-b02a-200faea97071', 'Half-Yearly Elite', 7500, '2026-06-18', '2026-12-15', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('9089bf5b-12ed-4aad-b69a-160b63a9cf02', 7500, 7500, 'UPI', '2026-06-18');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('c7c33f09-6886-4784-a9eb-f31a774f6221', 'Priyanka Joshi', '9732554496', 'Male', 'O+', 'Morning', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('8b7fb61d-3802-4fa6-992a-1d8dec7eb0a8', 'c7c33f09-6886-4784-a9eb-f31a774f6221', 'Monthly Basic', 1500, '2026-06-16', '2026-07-16', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('8b7fb61d-3802-4fa6-992a-1d8dec7eb0a8', 1500, 1500, 'UPI', '2026-06-16');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('557dc9a1-053f-46d4-8c6d-c3ac0d34dcc4', 'Ansh Mehta', '9708199458', 'Female', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('1dab360e-b285-4fbb-ab09-43653ba2b884', '557dc9a1-053f-46d4-8c6d-c3ac0d34dcc4', 'Couple Monthly', 2500, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('1dab360e-b285-4fbb-ab09-43653ba2b884', 2500, 2500, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('a1640e93-c9b5-4520-9781-428bac578672', 'Shruti Kumar', '9108144377', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('169cb215-49d2-489f-bf0b-a700d562ae9d', 'a1640e93-c9b5-4520-9781-428bac578672', 'Half-Yearly Elite', 7500, '2026-06-20', '2026-12-17', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('169cb215-49d2-489f-bf0b-a700d562ae9d', 7500, 7500, 'UPI', '2026-06-20');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('5416cc69-65ac-4c20-b083-5bc386a0f1c8', 'Pranav Kumar', '9549737679', 'Male', 'B+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('f3c3763d-d6e2-454e-8813-065c5861ca4a', '5416cc69-65ac-4c20-b083-5bc386a0f1c8', 'Quarterly Pro', 4000, '2026-06-17', '2026-09-15', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('f3c3763d-d6e2-454e-8813-065c5861ca4a', 4000, 4000, 'UPI', '2026-06-17');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('d57194a4-9ab8-4da5-9819-17115dbf3d55', 'Aarav Gupta', '9024933469', 'Female', 'A+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('03b25d42-8f97-48d6-9ea1-05d8092f46d1', 'd57194a4-9ab8-4da5-9819-17115dbf3d55', 'Monthly Basic', 1500, '2026-05-12', '2026-07-12', 'expired');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('03b25d42-8f97-48d6-9ea1-05d8092f46d1', 1500, 1500, 'UPI', '2026-05-12');

INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('d7689fa7-a0e6-4865-826b-b675a1981649', 'Sai Bhatia', '9733795558', 'Female', 'O+', 'Evening', 'General Fitness');
INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('fa95de1c-d8fe-45fc-a527-efc71febc1f7', 'd7689fa7-a0e6-4865-826b-b675a1981649', 'Monthly Basic', 1500, '2026-06-21', '2026-07-21', 'active');
INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('fa95de1c-d8fe-45fc-a527-efc71febc1f7', 1500, 1500, 'UPI', '2026-06-21');

