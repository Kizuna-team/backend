--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: orientation_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orientation_enum AS ENUM (
    '異性戀',
    '同性戀',
    '雙性戀'
);


ALTER TYPE public.orientation_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    location character varying(255),
    date date NOT NULL,
    description text,
    created_by character varying(255),
    "createdAt" timestamp without time zone DEFAULT now(),
    image_url character varying(255),
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO postgres;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: gift_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gift_orders (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    order_id character varying(40),
    status character varying(20) DEFAULT 'pending'::character varying,
    transaction_id character varying(100),
    amount integer NOT NULL
);


ALTER TABLE public.gift_orders OWNER TO postgres;

--
-- Name: gift_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gift_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gift_orders_id_seq OWNER TO postgres;

--
-- Name: gift_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gift_orders_id_seq OWNED BY public.gift_orders.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    room_id integer NOT NULL,
    sender_id integer NOT NULL,
    content character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    gift_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.photos (
    id integer NOT NULL,
    image_url character varying(255),
    image_key character varying(255),
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.photos OWNER TO postgres;

--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.photos_id_seq OWNER TO postgres;

--
-- Name: photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.photos_id_seq OWNED BY public.photos.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    price integer NOT NULL,
    description character varying(255) NOT NULL,
    image_url character varying(255) NOT NULL,
    inventory integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    category character varying(100),
    sales integer DEFAULT 0
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    user_id integer NOT NULL,
    name character varying(15) NOT NULL,
    gender character varying(8) NOT NULL,
    orientation public.orientation_enum NOT NULL,
    bio character varying(255),
    age integer NOT NULL,
    location character varying(31) NOT NULL,
    zodiac character varying(15),
    mbti character varying(5),
    job character varying(15),
    interests character varying(15)[] NOT NULL,
    last_active_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    price integer NOT NULL,
    description character varying(255) DEFAULT '尚未填寫描述'::character varying
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_plans_id_seq OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    plan character varying(20) NOT NULL,
    price integer NOT NULL,
    status character varying(20) NOT NULL,
    merchanttradeno character varying(30) NOT NULL,
    trade_no character varying(30),
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    raw_password character varying(20) NOT NULL,
    subscription_plan integer DEFAULT 1 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: gift_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_orders ALTER COLUMN id SET DEFAULT nextval('public.gift_orders_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.photos ALTER COLUMN id SET DEFAULT nextval('public.photos_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, title, location, date, description, created_by, "createdAt", image_url, created_by_id, created_at) FROM stdin;
2	測試活動標題2	台北101	2025-07-01	這是1個101活動	melody	2025-06-12 17:42:05.24769	https://activityimage.s3.ap-southeast-2.amazonaws.com/39092043-7c08-43fc-9261-5ca517d77ed5.png	202	2025-06-11 23:03:34.565113
3	測試活動標題3	台北101	2025-07-01	這是1個101活動	melody	2025-06-12 17:42:05.24769	https://activityimage.s3.ap-southeast-2.amazonaws.com/e011949a-5f26-48e0-8928-a182d0a482ea.png	202	2025-06-11 23:03:46.834586
4	改台中	台中	2025-07-01	蹦蹦蹦	melody	2025-06-12 17:42:05.24769	https://activityimage.s3.ap-southeast-2.amazonaws.com/4c415990-a6f3-4cbe-8862-18fc2c24a8d0.png	202	2025-06-11 15:21:29.745
5	測試活動2	台北	2025-07-01	這是1個台北活動	melody	2025-06-12 17:42:05.24769	https://activityimage.s3.ap-southeast-2.amazonaws.com/cfa605c6-3840-4055-91cd-4ae8bb4750a9.png	202	2025-06-11 23:05:51.046702
6	測試活動3	台北	2025-07-01	這是1個台北活動	melody	2025-06-12 17:42:05.24769	https://activityimage.s3.ap-southeast-2.amazonaws.com/1e0841b6-5ab4-4da7-9657-fd12fb1c2662.png	202	2025-06-11 23:05:57.968835
\.


--
-- Data for Name: gift_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gift_orders (id, sender_id, receiver_id, created_at, order_id, status, transaction_id, amount) FROM stdin;
6	2	10	2025-06-07 16:52:08.361813	OD-20250607-GOUBV91I	failed	\N	345
7	2	10	2025-06-07 16:56:31.300574	OD-20250607-ETKAV0J7	failed	\N	345
8	2	10	2025-06-07 16:57:59.298782	OD-20250607-RJL4LP0V	failed	\N	345
9	2	10	2025-06-07 17:02:48.299738	OD-20250607-XO8MEOTL	failed	\N	345
10	2	10	2025-06-07 17:03:32.656833	OD-20250607-ZLN0NLKU	failed	\N	345
11	2	10	2025-06-07 19:29:44.298563	OD-20250607-U56632MN	failed	\N	315
12	2	10	2025-06-07 19:52:40.226947	OD-20250607-JBY0SYK4	failed	\N	315
13	2	10	2025-06-07 19:55:37.765173	OD-20250607-OTNHWCLW	pending	\N	315
14	2	10	2025-06-07 19:57:07.88115	OD-20250607-1KHTIYAQ	pending	\N	440
15	2	10	2025-06-07 20:16:58.868133	OD-20250607-BQO9T9C5	paid	2025060702288716210	225
16	2	10	2025-06-07 20:24:06.874944	OD-20250607-P5NXJAA6	paid	2025060702288716310	130
17	2	10	2025-06-08 13:31:32.992441	OD-20250608-37U4I85T	pending	\N	135
18	2	10	2025-06-08 13:47:31.723965	OD-20250608-I80W79SJ	pending	\N	180
19	2	10	2025-06-08 13:54:32.412884	OD-20250608-VKO7JBVL	pending	\N	135
20	2	10	2025-06-08 14:00:19.588199	OD-20250608-Z7W1HGGP	pending	\N	315
21	2	10	2025-06-08 14:11:02.260135	OD-20250608-MTXT5930	pending	\N	135
22	2	10	2025-06-08 14:13:27.228855	OD-20250608-6Q8TSGD2	pending	\N	135
23	2	10	2025-06-08 14:16:44.087108	OD-20250608-QBI4F7QP	pending	\N	135
24	2	10	2025-06-08 14:19:07.912068	OD-20250608-6YNMM24R	pending	\N	135
25	2	10	2025-06-08 14:21:34.333728	OD-20250608-T14ICCMD	pending	\N	135
26	2	10	2025-06-08 14:23:50.543555	OD-20250608-PQPIUQMG	pending	\N	135
27	2	10	2025-06-08 14:39:49.311644	OD-20250608-S1I1KCCB	pending	\N	135
28	2	10	2025-06-08 16:25:05.751121	OD-20250608-U0QT7YEH	pending	\N	135
29	2	10	2025-06-08 16:25:40.038962	OD-20250608-Y6RNFOJT	pending	\N	135
30	2	10	2025-06-08 16:26:31.602905	OD-20250608-BEOD9K5P	pending	\N	135
31	2	10	2025-06-10 11:34:12.455028	OD-20250610-5UJ6L7D6	paid	2025061002289027810	260
32	2	10	2025-06-10 15:20:21.716719	OD-20250610-2RG2OBF0	paid	2025061002289096510	405
33	2	10	2025-06-10 16:22:45.242915	OD-20250610-N9GRGZGY	paid	2025061002289111010	1125
34	2	10	2025-06-10 18:59:13.931499	OD-20250610-W4H4INC6	pending	\N	85
40	2	10	2025-06-13 11:00:24.293041	OD-20250613-Q09U0NUB	pending	\N	225
41	2	10	2025-06-13 11:03:13.935174	OD-20250613-HZSZ8OV2	pending	\N	90
42	2	10	2025-06-13 11:05:11.063901	OD-20250613-JPHMU8JG	pending	\N	90
43	2	10	2025-06-13 11:05:50.280311	OD-20250613-F1JKQIS8	pending	\N	90
44	2	10	2025-06-13 11:07:02.054307	OD-20250613-S339JB46	pending	\N	90
45	2	10	2025-06-13 11:18:48.993215	OD-20250613-FX9KIZKY	paid	2025061302289467710	90
46	2	10	2025-06-13 11:21:05.184049	OD-20250613-XORN68PO	pending	\N	90
47	2	10	2025-06-13 11:21:59.815027	OD-20250613-FKOAJILL	pending	\N	45
48	2	10	2025-06-13 11:22:32.818554	OD-20250613-0MMMZBRE	pending	\N	45
49	2	10	2025-06-13 11:23:43.428447	OD-20250613-AK1HCCUU	pending	\N	45
50	2	10	2025-06-13 11:24:05.487501	OD-20250613-0MKTNU92	pending	\N	45
51	2	10	2025-06-13 11:24:29.968735	OD-20250613-3R111ILM	pending	\N	45
52	2	10	2025-06-13 11:24:49.243709	OD-20250613-DEATFYW8	paid	2025061302289470310	90
54	2	10	2025-06-13 22:40:08.61066	OD-20250613-951UBDSG	paid	2025061302289558010	90
55	2	10	2025-06-13 22:48:09.218496	OD-20250613-2XREZBKY	paid	2025061302289558910	90
56	2	10	2025-06-13 22:49:09.822641	OD-20250613-GSRJN9VL	paid	2025061302289559010	45
57	2	10	2025-06-13 23:00:21.967225	OD-20250613-94II0XGA	paid	2025061402289559910	120
58	2	10	2025-06-13 23:03:41.265721	OD-20250613-6OP2UO4M	paid	2025061402289560410	1125
59	2	10	2025-06-13 23:06:11.463391	OD-20250613-G2UF9TYZ	paid	2025061402289560610	1575
60	2	10	2025-06-13 23:07:28.415207	OD-20250613-0QUXJB81	paid	2025061402289560710	1575
61	2	10	2025-06-13 23:09:06.06961	OD-20250613-H53PKATA	paid	2025061402289560910	1575
62	2	10	2025-06-13 23:12:21.306431	OD-20250613-FE24FH4E	paid	2025061402289561210	1575
63	2	10	2025-06-13 23:43:51.148479	OD-20250613-2XTR9GYT	paid	2025061402289564810	1260
64	2	10	2025-06-15 15:33:28.515801	OD-20250615-LA52FMHP	paid	2025061502289643710	130
65	2	10	2025-06-15 20:43:04.746839	OD-20250615-0D0EMXG7	paid	2025061502289672210	90
66	2	10	2025-06-15 20:51:24.981898	OD-20250615-WPFGZANB	paid	2025061502289675510	45
67	2	10	2025-06-15 20:53:45.065979	OD-20250615-I9JX1QZA	paid	2025061502289676310	170
68	2	10	2025-06-15 21:39:05.99146	OD-20250615-8PTY9B9V	paid	2025061502289693510	135
69	2	10	2025-06-15 21:43:04.938916	OD-20250615-09BDW93Y	paid	2025061502289693810	225
70	2	10	2025-06-15 21:49:09.451734	OD-20250615-MTIGNB77	paid	2025061502289694010	135
72	2	10	2025-06-15 21:54:43.43488	OD-20250615-3SAP1XHF	paid	2025061502289694310	90
73	2	10	2025-06-15 21:57:37.075672	OD-20250615-KW7ANL5W	paid	2025061502289694410	45
74	2	10	2025-06-15 22:01:43.22502	OD-20250615-TP6NNE0K	paid	2025061502289694710	45
75	2	10	2025-06-15 22:10:22.005409	OD-20250615-BCEJVK05	paid	2025061502289694810	135
76	2	10	2025-06-15 22:24:52.190431	OD-20250615-PWNBCIJL	paid	2025061502289695110	90
77	2	10	2025-06-15 22:39:27.022996	OD-20250615-MEP8SXW8	paid	2025061502289695610	180
78	2	10	2025-06-15 22:52:11.130504	OD-20250615-642QP8J8	paid	2025061502289695710	225
79	2	10	2025-06-15 23:07:05.616033	OD-20250615-Y7JS1OB2	paid	2025061602289696910	315
80	2	10	2025-06-15 23:49:41.060735	OD-20250615-6RSVR57Y	paid	2025061602289698410	180
81	2	10	2025-06-16 00:04:17.702045	OD-20250615-WFYENW40	paid	2025061602289699010	90
82	2	10	2025-06-16 00:09:47.71206	OD-20250615-Z40EH7CQ	pending	\N	45
83	2	10	2025-06-16 00:13:53.567606	OD-20250615-A0Z1PPQ6	pending	\N	90
84	2	10	2025-06-16 10:09:39.521183	OD-20250616-HL2KQJGI	paid	2025061602289721910	315
85	2	10	2025-06-16 10:11:47.290373	OD-20250616-ZESF9Q1O	failed	\N	90
86	2	10	2025-06-16 10:11:56.327834	OD-20250616-3I3981CA	failed	\N	90
91	2	10	2025-06-16 10:24:02.588742	OD-20250616-C79ZML4Y	paid	2025061602289724610	315
92	2	10	2025-06-16 10:29:09.919022	OD-20250616-3B7SJDGN	paid	2025061602289725210	225
93	2	10	2025-06-16 10:36:20.727893	OD-20250616-R0JLYYWV	paid	2025061602289726910	135
95	2	10	2025-06-16 11:25:11.502973	OD-20250616-PB50J2TG	paid	2025061602289735710	225
96	2	10	2025-06-16 14:04:12.501839	OD-20250616-R8UYZ3GN	paid	2025061602289757410	205
97	2	10	2025-06-16 14:26:56.773643	OD-20250616-HNEMZBGM	paid	2025061602289762310	395
98	2	10	2025-06-16 16:15:37.996667	OD-20250616-BET50SHR	paid	2025061602289789410	85
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, room_id, sender_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, gift_order_id, product_id, quantity) FROM stdin;
7	6	18	1
8	6	17	1
9	6	16	3
10	6	21	1
11	6	23	1
12	6	25	1
13	7	18	1
14	7	17	1
15	7	16	3
16	7	21	1
17	7	23	1
18	7	25	1
19	8	18	1
20	8	17	1
21	8	16	3
22	8	21	1
23	8	23	1
24	8	25	1
25	9	18	1
26	9	17	1
27	9	16	3
28	9	21	1
29	9	23	1
30	9	25	1
31	10	18	1
32	10	17	1
33	10	16	3
34	10	21	1
35	10	23	1
36	10	25	1
37	11	18	3
38	11	21	2
39	11	19	1
40	11	24	1
41	12	18	3
42	12	21	2
43	12	19	1
44	12	24	1
45	13	18	3
46	13	21	2
47	13	19	1
48	13	24	1
49	14	17	2
50	14	16	2
51	14	18	2
52	14	21	4
53	15	17	2
54	15	18	2
55	15	21	1
56	16	17	1
57	16	16	1
58	16	19	1
59	17	17	1
60	17	18	2
61	18	17	1
62	18	18	1
63	18	19	1
64	18	20	1
65	19	17	1
66	19	18	1
67	19	19	1
68	20	19	1
69	20	20	1
70	20	21	1
71	20	17	2
72	20	23	2
73	21	19	1
74	21	20	1
75	21	21	1
76	22	19	1
77	22	20	1
78	22	21	1
79	23	19	1
80	23	20	1
81	23	21	1
82	24	19	1
83	24	20	1
84	24	21	1
85	25	19	1
86	25	20	1
87	25	21	1
88	26	19	1
89	26	20	1
90	26	21	1
91	27	19	1
92	27	20	1
93	27	21	1
94	28	19	1
95	28	20	1
96	28	21	1
97	29	19	1
98	29	20	1
99	29	21	1
100	30	19	1
101	30	20	1
102	30	21	1
103	31	16	2
104	31	17	1
105	31	22	1
106	31	23	1
107	31	25	1
108	32	18	1
109	32	19	2
110	32	20	2
111	32	21	2
112	32	22	1
113	32	23	1
114	33	17	4
115	33	18	8
116	33	21	13
117	34	16	1
118	34	17	1
119	40	17	1
120	40	18	1
121	40	20	1
122	40	21	1
123	40	22	1
124	41	18	1
125	41	19	1
126	42	17	1
127	42	18	1
128	43	18	1
129	43	20	1
130	44	18	1
131	44	19	1
132	45	17	1
133	45	19	1
134	46	19	1
135	46	21	1
136	47	17	1
137	48	19	1
138	49	18	1
139	50	18	1
140	51	18	1
141	52	19	1
142	52	20	1
145	54	18	1
146	54	20	1
147	55	17	1
148	55	20	1
149	56	20	1
150	57	16	3
151	58	26	25
152	59	19	35
153	60	19	35
154	61	19	35
155	62	19	35
156	63	18	28
157	64	16	1
158	64	17	1
159	64	18	1
160	65	18	1
161	65	20	1
162	66	19	1
163	67	19	1
164	67	20	1
165	67	16	2
166	68	17	2
167	68	18	1
168	69	19	4
169	69	20	1
170	70	19	1
171	70	20	1
172	70	18	1
175	72	18	1
176	72	19	1
177	73	19	1
178	74	19	1
179	75	19	1
180	75	21	2
181	76	20	1
182	76	21	1
183	77	18	2
184	77	20	2
185	78	17	3
186	78	20	2
187	79	18	3
188	79	20	3
189	79	19	1
190	80	17	1
191	80	19	2
192	80	18	1
193	81	18	1
194	81	19	1
195	82	18	1
196	83	18	1
197	83	20	1
198	84	17	4
199	84	18	3
200	85	17	1
201	85	18	1
202	86	17	1
203	86	18	1
212	91	17	3
213	91	18	4
214	92	17	3
215	92	18	2
216	93	20	1
217	93	19	1
218	93	22	1
222	95	19	3
223	95	20	1
224	95	22	1
225	96	22	1
226	96	16	4
227	97	16	2
228	97	22	3
229	97	20	4
230	98	16	1
231	98	22	1
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.photos (id, image_url, image_key, uploaded_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, price, description, image_url, inventory, created_at, category, sales) FROM stdin;
25	抹茶鮮奶	45	濃郁抹茶與鮮奶融合，口感滑順，帶有淡淡茶香，回味無窮。	https://product-image2.s3.ap-southeast-2.amazonaws.com/f38116df-5b67-49d1-9986-85032bf0750f-抹茶鮮奶.jpg	50	2025-06-05 13:32:56.807351	\N	0
26	香柚綠茶	45	香甜柚子與綠茶結合，清新果香與茶韻交織，帶來清爽口感。	https://product-image2.s3.ap-southeast-2.amazonaws.com/28001530-de10-4f47-ba01-4ec87607ef02-香柚綠茶.jpg	50	2025-06-05 13:32:56.807351	\N	0
27	琥珀烏龍珍珠拿鐵	45	琥珀色烏龍茶與鮮奶融合，搭配Q彈珍珠，茶香濃郁，口感豐富。	https://product-image2.s3.ap-southeast-2.amazonaws.com/14bea073-815a-4d51-b1fc-4d1113d8546f-琥珀烏龍珍珠拿鐵.jpg	50	2025-06-05 13:32:56.807351	\N	0
16	伯爵鮮奶	40	伯爵鮮奶是一款結合經典英式風味與台灣人熟悉奶香的飲品。使用特選伯爵茶葉沖泡而成，其獨特的佛手柑香氣與淡雅茶韻，經過鮮奶的柔和包覆，口感滑順，層次分明。	https://product-image2.s3.ap-southeast-2.amazonaws.com/7f5ae53a-e378-44c4-a49d-ae9a9ae3325a-伯爵鮮奶.jpg	-1	2025-06-05 11:10:11.597667	\N	7
22	手炒黑糖鮮奶	45	手工炒製黑糖，香氣濃郁，搭配鮮奶，甜而不膩，口感豐富。	https://product-image2.s3.ap-southeast-2.amazonaws.com/e81c1b7b-c11f-4821-95ff-6fcccc97656d-手炒黑糖鮮奶.jpg	43	2025-06-05 13:32:56.807351	\N	7
23	柳丁綠茶	45	新鮮柳丁汁與綠茶融合，酸甜清香，帶來自然的果香風味。	https://product-image2.s3.ap-southeast-2.amazonaws.com/81ebbe1d-6e15-43fb-8ba0-905e68287f89-柳丁綠茶.jpg	25	2025-06-05 13:32:56.807351	\N	0
24	伯爵紅茶拿鐵	45	經典伯爵紅茶與鮮奶結合，佛手柑香氣與奶香交織，口感溫潤。	https://product-image2.s3.ap-southeast-2.amazonaws.com/8ce1c074-1d60-435e-a032-c5be870ff939-伯爵紅茶拿鐵.jpg	40	2025-06-05 13:32:56.807351	\N	0
21	青檸香茶	45	新鮮青檸與香茶結合，酸甜適中，帶來清爽提神的口感。	https://product-image2.s3.ap-southeast-2.amazonaws.com/b7788f52-15e4-41a3-a37e-d3a59c8de2f9-青檸香茶.jpg	53	2025-06-05 13:32:56.807351	\N	0
20	原片青茶拿鐵	45	精選原片青茶，茶香清新，與鮮奶融合，口感溫潤，餘韻悠長。	https://product-image2.s3.ap-southeast-2.amazonaws.com/96cd516f-db8e-496f-9a4c-da0902d17c9d-原片青茶拿鐵.jpg	12	2025-06-05 13:32:56.807351	\N	6
19	玄米抹茶鮮奶	45	香濃抹茶與玄米的獨特香氣交織，搭配鮮奶，帶來層次分明的口感體驗。	https://product-image2.s3.ap-southeast-2.amazonaws.com/675e69b9-a293-45ea-9552-e364c1f0522a-玄米抹茶鮮奶.jpg	26	2025-06-05 13:32:56.807351	\N	4
17	芋頭鮮奶	45	選用綿密香甜的芋頭，搭配濃郁鮮奶，口感滑順，甜而不膩，帶來濃厚的家鄉味。	https://product-image2.s3.ap-southeast-2.amazonaws.com/f60903a3-a0b5-476d-92aa-03a2f7bead2b-芋頭鮮奶.jpg	5	2025-06-05 13:32:56.807351	\N	10
18	嫩仙草凍奶	45	嫩滑的仙草凍與香醇鮮奶完美融合，清涼爽口，帶來夏日的清新感受。	https://product-image2.s3.ap-southeast-2.amazonaws.com/cb6d5dc0-da48-458f-9dc7-599ff427b37e-嫩仙草凍奶.jpg	2	2025-06-05 13:32:56.807351	\N	9
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (user_id, name, gender, orientation, bio, age, location, zodiac, mbti, job, interests, last_active_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, price, description) FROM stdin;
1	免費會員	0	基礎交友功能
2	高級會員	299	解除高級會員功能，交友功能增加
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, plan, price, status, merchanttradeno, trade_no, paid_at, created_at) FROM stdin;
35	202	高級會員	299	pending	SUB1749487848388	\N	\N	2025-06-09 16:50:48.389
37	203	高級會員	299	pending	SUB1749492032724	\N	\N	2025-06-09 18:00:32.725
38	203	高級會員	299	paid	SUB1749492087083	2506100201273302	2025-06-09 18:01:59	2025-06-09 18:01:27.084
36	203	高級會員	299	paid	SUB1749491673887	2506100154343300	2025-06-09 17:55:08	2025-06-09 17:54:33.888
39	204	高級會員	299	paid	SUB1749492713469	2506100211533303	2025-06-09 18:12:52	2025-06-09 18:11:53.47
40	205	高級會員	299	pending	SUB1749495617587	\N	\N	2025-06-09 19:00:17.588
41	206	高級會員	299	pending	SUB1749495807318	\N	\N	2025-06-09 19:03:27.319
42	207	高級會員	299	pending	SUB1749495992671	\N	\N	2025-06-09 19:06:32.671
43	207	高級會員	299	pending	SUB1749496476634	\N	\N	2025-06-09 19:14:36.635
44	207	高級會員	299	paid	SUB1749496579847	2506100316193320	2025-06-09 19:16:46	2025-06-09 19:16:19.848
45	208	高級會員	299	paid	SUB1749496698363	2506100318183321	2025-06-09 19:19:00	2025-06-09 19:18:18.364
46	209	高級會員	299	paid	SUB1749526354614	2506101132353626	2025-06-10 03:33:13	2025-06-10 03:32:34.615
47	210	高級會員	299	paid	SUB1749538822882	2506101500234331	2025-06-10 07:01:50	2025-06-10 07:00:22.883
48	211	高級會員	299	pending	SUB1749544026634	\N	\N	2025-06-10 08:27:06.635
49	211	高級會員	299	paid	SUB1749544067933	2506101627484784	2025-06-10 08:28:21	2025-06-10 08:27:47.935
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, raw_password, subscription_plan, updated_at) FROM stdin;
2	user1	$2b$10$m.kcSjXiRalIa3/0fH3PgOs77kFyyOT2HpOpY.0HXEfmI6LFlv9ky	pass123	1	2025-06-15 00:34:00.641856
3	user2	$2b$10$mHQahewlA6GitgZlXqo3euBarM5m55qVL4g9S3BJXFiGphJvotJWC	apple2024	1	2025-06-15 00:34:00.641856
4	user3	$2b$10$O9Gn/RIE.ieoLhkYrnPXJ.JRn9f7f2vug32Xk8PzD4mQbbvs55BPq	hello321	1	2025-06-15 00:34:00.641856
5	user4	$2b$10$/OSBJyMb34yQD89OTnh/hOs/8bHC5dblVn8s3LzE9fIidcryKFXma	snowman11	1	2025-06-15 00:34:00.641856
6	user5	$2b$10$Y5on8390dhAHmsTxvatKfeoYDcAnQGeLYOgvXM0WGiFY1ufreb.Ie	sun6789	1	2025-06-15 00:34:00.641856
7	user6	$2b$10$pp.2a7mJpTtjVZqsUxG5auldJqvsscMZhHbckHSTVyvEOeoSOYQJq	music123	1	2025-06-15 00:34:00.641856
8	user7	$2b$10$D/8vd/ekHmH0fVSIobtageb08XdjG.YNUYFxvwVOKUBTQgk.tpeo2	fashion99	1	2025-06-15 00:34:00.641856
9	user8	$2b$10$AoGsP35kjh/PvicPPVZWlO9ZFy8nadcpiBZlAku1adIj3jlpVT6a2	runner88	1	2025-06-15 00:34:00.641856
10	user9	$2b$10$CfGzO7/Q3GcaBHhTXBEIu./VzgtgTN9P4lWXWcaQJXIMeyw4QQjcG	drawme56	1	2025-06-15 00:34:00.641856
11	user10	$2b$10$yBjp5T7VxkLR9fmbvi0wSOykNCX886IeqaPwXTcowu/i5TZzLKz3K	12design	1	2025-06-15 00:34:00.641856
12	user11	$2b$10$h1MseOtreAmRhwDSMXMcXOQ0tAJCpN4nXTXuK4V129mP998.msrie	catlove	1	2025-06-15 00:34:00.641856
13	user12	$2b$10$2z6KHtjTYi7HZVkKlaByZeGK73.LUUToklGS.paPq5TI4xBGtBO5e	ocean77	1	2025-06-15 00:34:00.641856
14	user13	$2b$10$fDOvm06lIgANVpwtzrNgNetrpBEd579oaD3M4.glbMKPPZZiPlxJy	flower88	1	2025-06-15 00:34:00.641856
15	user14	$2b$10$n4x.D8Me.J8K2czMt852YebEnAdf/Yvf2GV81Obi9qhNrLCvrNoJu	sky555	1	2025-06-15 00:34:00.641856
16	user15	$2b$10$CtDeiD/Gn8hzlVbIqMvGF.DBuh.B7lOJNKMGHAXuc3hU1q7SL3ZR.	dreamer	1	2025-06-15 00:34:00.641856
17	user16	$2b$10$5xD9SmD/odmieN8pC2ORueWOMNqXMgokc.evX0cUjz8EXE2DQVIMe	moonlight	1	2025-06-15 00:34:00.641856
18	user17	$2b$10$fz5YlUeuxk53dguP9V5XRuQm3Wg9..ezQlUxJUQYXKarYRamzn7rK	star999	1	2025-06-15 00:34:00.641856
19	user18	$2b$10$7dZVrppm6T4a1NRBHp1/EeQmKk3jQ02WX7wrvtGgKqcYjWqaRbQqe	guitar321	1	2025-06-15 00:34:00.641856
20	user19	$2b$10$5WuYi9HEsiKFI5nz8oaIv.HLWKAAGfscy6u3Bgcih4EmLDSqcyMd6	happy333	1	2025-06-15 00:34:00.641856
21	user20	$2b$10$L82EbsnYZeqC58xh9UEXSOloF.zImaDzrqGW3FY1A6aAuY7OyBRCK	code888	1	2025-06-15 00:34:00.641856
22	user21	$2b$10$5SZ8cl5eJbws0JnDRtURZ.y0SIIXIYdd33goEBy7EecheOvkI5pP2	zen123	1	2025-06-15 00:34:00.641856
23	user22	$2b$10$yT7jg3e7o5LafinukfusdeQlGxXinjTUZ0uy/ZmRp3Nna5qTxEWNO	piano456	1	2025-06-15 00:34:00.641856
24	user23	$2b$10$MriCKisjg0tEtlFk3QERPuHXJ0T83xdFTl0c.baRkgG5RlhtdK1Wq	travel77	1	2025-06-15 00:34:00.641856
25	user24	$2b$10$wm41X3lAdfwDCk1QddsPneljI1cruiwCxpbZDZYC7pPZyPKm1AAXW	movie555	1	2025-06-15 00:34:00.641856
26	user25	$2b$10$J02fnwzGw3YCVT0Au5lOPuMqFiw3S3b7ehUF0Gi65mS/pXeqy1ncy	coffee999	1	2025-06-15 00:34:00.641856
27	user26	$2b$10$y33638wvtewbM9chJMtvTessWqPoeCOVC7.mov2wn2XxzGaIYpa0.	artlover	1	2025-06-15 00:34:00.641856
28	user27	$2b$10$WsyfG.vELuf/8XH83HnJJuCcADQyASjyG88aqchuWiyH0Brn14gtq	bookworm	1	2025-06-15 00:34:00.641856
29	user28	$2b$10$B.IoHaTwmecQPSj9/JibyOqvNPTUMyYnfAm7x0J1g00cGlMIi5F1q	runnerup	1	2025-06-15 00:34:00.641856
30	user29	$2b$10$VIsh3vpmmUPK3O.zlMoZ8O227o/X5XdjZuKesRmhutk2jU48grUUK	sweet22	1	2025-06-15 00:34:00.641856
31	user30	$2b$10$TiojWWI.VE.vfRYCAlohJ.jwvmWjWO5VYEAczuYz3u5UviiNJFDGO	coolman1	1	2025-06-15 00:34:00.641856
32	user31	$2b$10$g/ngpgdgXiCJOm5oM8D6suVyi6l9TomZWCiUToS85cX/sp5XI8qIW	summer55	1	2025-06-15 00:34:00.641856
33	user32	$2b$10$lNsPbI5R9oP.NWH4mw09de9wh4/1aeHb6rINmXxLkybz8KSTVg0Z.	spring66	1	2025-06-15 00:34:00.641856
34	user33	$2b$10$cnvHTovaRjJyLysq0I9zIuPzaNEc0KBCEMo0AeTsf8yjqLyppkheO	winter44	1	2025-06-15 00:34:00.641856
35	user34	$2b$10$FuliLi1fAE1s1oeCaxd1YO9Gy/nl1c9spJIZUEQ2SoVjzuLDgIvxW	autumn99	1	2025-06-15 00:34:00.641856
36	user35	$2b$10$jRxiEScCsd20C1l3rLEiHun8dvwJsJEkpQCkoRZgAwewqcldsiPNK	dance88	1	2025-06-15 00:34:00.641856
37	user36	$2b$10$6dtKKde3XzPo4yIQDDZj7.b4QPEhmPjwv4yzlk6EiyDi7YBrRBOcy	yoga777	1	2025-06-15 00:34:00.641856
38	user37	$2b$10$V2gUclRtsyIoPr1RfFm/OeQOcJ4WaaY3oqGfQ0apNPsyOFfzKo0eK	chef999	1	2025-06-15 00:34:00.641856
39	user38	$2b$10$jo.fj2z5ONXDY8ZFGXgQOORAGb4WwlOhfYvFfGg1NilHmFfNk1u3G	explorer	1	2025-06-15 00:34:00.641856
40	user39	$2b$10$M03gpOx.jXXBLg5VrC21jes1gvd7JCc9J0UPTu2HICMxenI1kD4iy	nature22	1	2025-06-15 00:34:00.641856
41	user40	$2b$10$ttMtU8WOKeVqyVKnterDVOGiKWcyjK8cukCJ7iD9c1HjF0acSVd5G	writer11	1	2025-06-15 00:34:00.641856
42	user41	$2b$10$w5Oawa9UCEoZyEN2y/xhP.4v0p9ChHSRr2hReidAvdinqRk9OlacG	hero777	1	2025-06-15 00:34:00.641856
43	user42	$2b$10$QbrZbWvUQNPRfc1uj91OA.rCTBWEQv460LrdVXgqCUVBD0ZaqLf6m	game999	1	2025-06-15 00:34:00.641856
44	user43	$2b$10$jF4IwylI2AYxbVFZzEVbYeaHkXPOBNwwbMNJhax9VnLFuuXiRGEjS	jazzman	1	2025-06-15 00:34:00.641856
45	user44	$2b$10$5olYpQt.4q1MZvvk8o6YKeUephriLvmOP77sbUk5YjbUBVrq.QQ/O	smile88	1	2025-06-15 00:34:00.641856
46	user45	$2b$10$TNb0VV7vL1bEoBOSJZMIHuEkjAI6a/8/ju8drI/KXPPQpkhpTPgOK	fashion21	1	2025-06-15 00:34:00.641856
47	user46	$2b$10$6NjQuwDpUWvAmmWz7ZMKNuKxdWI.Yu9JrZk8GddGNwRGaemiY3ln6	sport888	1	2025-06-15 00:34:00.641856
48	user47	$2b$10$6kUrXISXOBQZxF/sedUQHOfRi0jI3IJsFa8ASSg.SW5Il4PFhOD.2	dream77	1	2025-06-15 00:34:00.641856
49	user48	$2b$10$orEA5wzOP/jSzNi1Q45Lf.aD76Xk4LH12XR/qS1rDOzvP.aEs1hU.	sunshine	1	2025-06-15 00:34:00.641856
50	user49	$2b$10$8hByyqM40RNpFB4gTRJ9ZOvmujN.scT2K8R7PM89f/3cxKiWJEe8.	energy77	1	2025-06-15 00:34:00.641856
51	user50	$2b$10$VHtRZxmvcb1lwdswf9biOuM.8U.GnbYgI/e0YsYWcZq44FhQkY.Lm	magic999	1	2025-06-15 00:34:00.641856
52	user1	$2b$10$8b1ANJAmakzEgoztkIcloebj1tjnFTdEwhV3Y6HlZoesbU.30MjXS	pass123	1	2025-06-15 00:34:00.641856
53	user2	$2b$10$JBFftKTFUtn3OdIyGclLvOYpPbXwjF5UVFir/Sezi0pwXnq0pKIk.	apple2024	1	2025-06-15 00:34:00.641856
54	user3	$2b$10$jAsguzUmdyL8FaURoZitDOMNRDoS05zh02IFC9Hb2C5XgL/IthTY6	hello321	1	2025-06-15 00:34:00.641856
55	user4	$2b$10$ZsQJTRO95hNFPAujJu0U0uTgTrTZ6H.F7uMNYlw/.tUsbMriS8IZ6	snowman11	1	2025-06-15 00:34:00.641856
56	user5	$2b$10$d2HlVmxCComVG.9.MwHe/uWbMMPREimu07xWAxnlzJvfwLKc7/oHO	sun6789	1	2025-06-15 00:34:00.641856
57	user6	$2b$10$Ld7Psg7sgSnuWOcAoPDcRuHB2xFXG.8XLg1PPtqUaxP2wyivAyvy2	music123	1	2025-06-15 00:34:00.641856
58	user7	$2b$10$D.xdOHJA.sIYtz/mhZYraOn7f/7EgNjbPF24nbAeF/IbLoGlxQhJa	fashion99	1	2025-06-15 00:34:00.641856
59	user8	$2b$10$99qazHpV2Rt7uwGy5T0JXeQqLNm673gEbD.TLtpqIeU.w9lqz2lY.	runner88	1	2025-06-15 00:34:00.641856
60	user9	$2b$10$OQz2PG8hCvvR6mOzp9aY2OIJRrHDezNZepzaC7tkgd.JL50.6.9dq	drawme56	1	2025-06-15 00:34:00.641856
61	user10	$2b$10$t1ATyoiZc6nVimZ/LgpgOegbAPZQcJ6AA/yLxkXpwXASS8k6Byg7W	12design	1	2025-06-15 00:34:00.641856
62	user11	$2b$10$jOIoIXGFpf770Etzes0YpeFMIS5GoRwH0PX.fVlZtoED9o7hGn5l6	catlove	1	2025-06-15 00:34:00.641856
63	user12	$2b$10$4Vt8rcCmxQB4CoIYJntEfew/YZSrcgveNY0bJZK0sTBud69jCew7i	ocean77	1	2025-06-15 00:34:00.641856
64	user13	$2b$10$WXGz4Vwqze5PUykQWJLQXe.HL9gEKWdCVNG0517G5EFDp9B79OubO	flower88	1	2025-06-15 00:34:00.641856
65	user14	$2b$10$SlzYxZv1OfF3DiKBzTQh.uVqcYENykCXZDBqfW.UnhFCesPHZvAzu	sky555	1	2025-06-15 00:34:00.641856
66	user15	$2b$10$rAUsRbFwdgsYRSTwX12K0.RqRmnoCEbAI8I5bqefTRdbzprZCXyCW	dreamer	1	2025-06-15 00:34:00.641856
67	user16	$2b$10$G5fYyFo8WDjjKr2oElzfFOJU7sGzKTAQwDJjeHelj0JgDZq2NUcm2	moonlight	1	2025-06-15 00:34:00.641856
68	user17	$2b$10$BZnd3yVPUqbFwEYaY4NWFu164T2t1c645rs23rtT5IG/ctMUZi9Yu	star999	1	2025-06-15 00:34:00.641856
69	user18	$2b$10$Z7CZjNgiU6/BdnLyLqAEruVqHZAGE/dQfSuE0oBzYGw2G1Zv8flTa	guitar321	1	2025-06-15 00:34:00.641856
70	user19	$2b$10$Re4JwZpL2rBR6gcq0w.iq.skW3edpHhRxb8v3A8P1naeIWSZ6w7sq	happy333	1	2025-06-15 00:34:00.641856
71	user20	$2b$10$yhThbM1VvnjNG0ddgO/Ae.czqw5v2E54YXKk.g68xeIikv6T5t.aW	code888	1	2025-06-15 00:34:00.641856
72	user21	$2b$10$uXRcITLKGBKWs.k.YaqqYul5ZX6k5ki.jZQpE.LQ9wgPLZSCNniKm	zen123	1	2025-06-15 00:34:00.641856
73	user22	$2b$10$iFWmLRMUd5V0.1gp83/q8eebDnh3QAMPvRNTUVUPZgSxlyWsAwDXu	piano456	1	2025-06-15 00:34:00.641856
74	user23	$2b$10$tKVnW9VaHCpwgb91uMtC9e8Cx8u3Csf89kvU0M3IG9x4l2b308cwS	travel77	1	2025-06-15 00:34:00.641856
75	user24	$2b$10$66Ed.YaXYPq9SRFi6GmncO2XOkZT6sFCFjHJxWXgdZdrawd4CG8SS	movie555	1	2025-06-15 00:34:00.641856
76	user25	$2b$10$kR3WMmPYP1GTbWqELm/Tte0XUNFhLP.NMc6PE1ydDRe1c/dzK2NWm	coffee999	1	2025-06-15 00:34:00.641856
77	user26	$2b$10$vrqBShin9evsD5kMZLunPOdnFsIzKY9GZYDPVlvPyH1Z9w6f0byJu	artlover	1	2025-06-15 00:34:00.641856
78	user27	$2b$10$IcWs7H4.KzKKMmegspxfwOEWjVHuhImhYzMtQJypQonLEcQV8TajS	bookworm	1	2025-06-15 00:34:00.641856
79	user28	$2b$10$RP7wjD9PzAP3Le9nwk7JsOHTlZoDbUq3C2Fp.h0Ge3wuSUoAEh74m	runnerup	1	2025-06-15 00:34:00.641856
80	user29	$2b$10$ZC674PJ9RAIjkbnSyJHHQe7E7MxpDHavkkGQDAqkP2IdjT/tBPsGa	sweet22	1	2025-06-15 00:34:00.641856
81	user30	$2b$10$AH3KesiI/VsyqZ5oK3K42eRSk9UQg1hmbw/mWh8nZiCZMsMp95MWO	coolman1	1	2025-06-15 00:34:00.641856
82	user31	$2b$10$Zf5ArCUUxB3N60sHjeKGm.KXrsCeo2rivkWKcd6H3qUXO2PKbGwTq	summer55	1	2025-06-15 00:34:00.641856
83	user32	$2b$10$yokwiu2owqX.5uZmHzsDjORkesZyFl5EnjPRF/vVzGuCIonHuMKuO	spring66	1	2025-06-15 00:34:00.641856
84	user33	$2b$10$Ps.CS1s6jC7MhufI6tMur.SarpoWumHWB9hryeZ.xBZqPJ4Bjgmc2	winter44	1	2025-06-15 00:34:00.641856
85	user34	$2b$10$uXJOMbTk7N2rp7LpwIyoE.4YlqoIl9svkLzz3/bLsC0KP4lugMHJy	autumn99	1	2025-06-15 00:34:00.641856
86	user35	$2b$10$FbxEvZyZ15uErxskZ/6iq.JUa7RWB8H/yhO7gOpy9M2JLQJqGa8ze	dance88	1	2025-06-15 00:34:00.641856
87	user36	$2b$10$NYx1BHRbYfGpKM5auL2WaePxpG6CD/lluNR.JXMNONW6a7RYQHgce	yoga777	1	2025-06-15 00:34:00.641856
88	user37	$2b$10$dQgtGE7/BYDOT.AygO1P6.1XPkCbDB26nWEL/n7VtlFvEzJc9Jf1a	chef999	1	2025-06-15 00:34:00.641856
89	user38	$2b$10$//nbq3YXZQUA2GIftxkILOzjYJy4GntmyiSZtYdDUkMeVCEHS957e	explorer	1	2025-06-15 00:34:00.641856
90	user39	$2b$10$2VLIGqGmPq29eJb3IXzhZurFyD8qGhvsyhTRb2ficxqQArxVa6/yW	nature22	1	2025-06-15 00:34:00.641856
91	user40	$2b$10$3YnZkMIQEKOFlNHdy9NgV./7WbbZ4cXW1pNSR.br8qWMXbn/OsD1C	writer11	1	2025-06-15 00:34:00.641856
92	user41	$2b$10$u7vJwTiSx5B7c3YxqAGfnOUQWaUSYvXm00Jwq.OlrMJ6ohk3MKLtm	hero777	1	2025-06-15 00:34:00.641856
93	user42	$2b$10$vCsbDe.4j9CArva5rRFjyuHzbwk5z3mqs7NK0bAoUa3RPf.zrgl2a	game999	1	2025-06-15 00:34:00.641856
94	user43	$2b$10$8zEQYzBF4O.CwnvsjwJBKuai2X/YrpFZMQVDw7Ej/OVFHfcleOLwm	jazzman	1	2025-06-15 00:34:00.641856
95	user44	$2b$10$SgpbCN0yNfCg2O140A2sFOobF.euXJMBmQWWG1Slp4hMh207bzDWm	smile88	1	2025-06-15 00:34:00.641856
96	user45	$2b$10$DNx7WrBA8zWnQwd6LvNQmOBtIvyUHrE1WH4LnVw5xPksQw/6nMC5O	fashion21	1	2025-06-15 00:34:00.641856
97	user46	$2b$10$E7xY9m9zc6v/0suLrXUpn.aeLBmU.5Os53z0P8N2qwq9EyV1j7vgG	sport888	1	2025-06-15 00:34:00.641856
98	user47	$2b$10$/gv5t.sccNzM3/95S0WADO356JKWbP4XxufrssbNi.9pktm6pgTea	dream77	1	2025-06-15 00:34:00.641856
99	user48	$2b$10$B4PGhmt/o60JafVUYVNWlOXLksqceTROm.T3MyU7LnKwj0xp35OtC	sunshine	1	2025-06-15 00:34:00.641856
100	user49	$2b$10$QuXFm52BcadaWeCW1sixuuxN1cBOhqpKk.HwlIVlC9TzauDkEvGaa	energy77	1	2025-06-15 00:34:00.641856
101	user50	$2b$10$XBrPMkj.wBETrQlAo0E9B.C/jIglk.SzmxDd9Hb.n5uGVZWqUJABe	magic999	1	2025-06-15 00:34:00.641856
102	user1	$2b$10$moyfDn1HtDTMgy86Ou9Ad.ypBiRg8hSGOVh65P7OjSyadBSV63gf6	pass123	1	2025-06-15 00:34:00.641856
103	user2	$2b$10$Xxrjt/AcK6H.mc2NMF/5hecNd4mnQuHgXA8zly5sCxLgRWbKSw.ZS	apple2024	1	2025-06-15 00:34:00.641856
104	user3	$2b$10$jSascaPjRGaYe967EyErHO4/8Vu0ydYhjZJvB7nPRJpxEbo2uS7IS	hello321	1	2025-06-15 00:34:00.641856
105	user4	$2b$10$we3Lskk2YDhG0LPT/0/fHO0QYAIwEFplpRTIqDblpH/2b8VQztWvK	snowman11	1	2025-06-15 00:34:00.641856
106	user5	$2b$10$7FgpONW3exGzStb2t.em6eAB3Kg99PFQ5tfQKVkA3R1azYAvPgkPq	sun6789	1	2025-06-15 00:34:00.641856
107	user6	$2b$10$rR959l6hnyFBahszdlmJj.xxT56wkbZcf7gmO8eewZ6j87THxh53C	music123	1	2025-06-15 00:34:00.641856
108	user7	$2b$10$azycPwLstj3pNryWB7cNwePV1Fnu1RBnuuOIh.fODz5vzGzrgIUAm	fashion99	1	2025-06-15 00:34:00.641856
109	user8	$2b$10$tED1alp.5cD07ea13q51PO048ek0UdZ7VNWM9QAZYc73kD4KvxDPW	runner88	1	2025-06-15 00:34:00.641856
110	user9	$2b$10$G2rFwKr3tDBeTDgBxfedc./F10Ur2nc5RrIuGyyv/hsMAEpww/xiC	drawme56	1	2025-06-15 00:34:00.641856
111	user10	$2b$10$HgR4HHG.CeK2gi/niPoSHOG0grORmNUI7uQGsHsM4UArxQieGmnF6	12design	1	2025-06-15 00:34:00.641856
112	user11	$2b$10$2mTs12o4bS4Ju1vAs6RKl.34sAOP1yyCVx9xtmkeZgjdlc.embdIe	catlove	1	2025-06-15 00:34:00.641856
113	user12	$2b$10$X5u.rMvKAznov.6EGLYEuuIdm2nbeuX55q3rjsoIA4qxTz/nddfle	ocean77	1	2025-06-15 00:34:00.641856
114	user13	$2b$10$nxKxsLXbF.uUtjQ7HqL4B.sylSLmqY7wppeAVRRHZeOuywUFU1v5i	flower88	1	2025-06-15 00:34:00.641856
115	user14	$2b$10$RCDjkGaNIoUX4whUHNHrO.lMURzhmav/8jK7fpsDnlVjf3B.67yHW	sky555	1	2025-06-15 00:34:00.641856
116	user15	$2b$10$qKGl1x.I9hokAXQswOzj..YcbCR4i4lTGwKymhQc7EEWVu.y31Qa2	dreamer	1	2025-06-15 00:34:00.641856
117	user16	$2b$10$G85BztwBEuH7SxT/a0CGjODzROC/zYM/b/Nz1xfkopc2NWBcSzNxm	moonlight	1	2025-06-15 00:34:00.641856
118	user17	$2b$10$5k2LWl92PleMP5jmoB./jOUpREhrEZZR7MpYfx7F4NdOKBFZEK49u	star999	1	2025-06-15 00:34:00.641856
119	user18	$2b$10$EOUr6XBVyAeacb96hmQ5z.GjmmmD56iWwEupyjfv0909cetEmcoOS	guitar321	1	2025-06-15 00:34:00.641856
120	user19	$2b$10$/MDakRQeIxgy6BLVW1WtGev695Hhz.Ogc2ZRGUvf1i6Ig66nMaDim	happy333	1	2025-06-15 00:34:00.641856
121	user20	$2b$10$M7eMvzDGzQcgcLD1IntupOizmE4L5lhtWeLmgzGPuTkVf5l3Oqdzy	code888	1	2025-06-15 00:34:00.641856
122	user21	$2b$10$1kgcYoDa63VWisrNC61vj.49UreFp86DYZdcw2BE2kCKYiYqbRKY2	zen123	1	2025-06-15 00:34:00.641856
123	user22	$2b$10$1uc4SCISgIYG0U7k76OOl.lI5r82SlNcAX8QkefOGj0cjxYgYqBGu	piano456	1	2025-06-15 00:34:00.641856
124	user23	$2b$10$yaW6/tlWrqrjlPm7MdktzuU3KyUk2BXJ5rYkCFRiXPdB959JAESVS	travel77	1	2025-06-15 00:34:00.641856
125	user24	$2b$10$.3traOSLP43Pg7M5C28cYe7psMD165InUJLYH8DciOWIE0Jg2o3sS	movie555	1	2025-06-15 00:34:00.641856
126	user25	$2b$10$E0qVmy4IYRjDCK9JRGCLMeHsRy2eM6rDJQ7LOLfz/S71lOygag2Uy	coffee999	1	2025-06-15 00:34:00.641856
127	user26	$2b$10$GdnwVvll9l2BYYTpZPs.fenbgVoP7iX1XhAB68Z6YSNctHYtfuQu2	artlover	1	2025-06-15 00:34:00.641856
128	user27	$2b$10$ZDNK2favHbTZHW5onSpLge8DtnuoDpHwOuJkhkWFzdHyO9/XgecSC	bookworm	1	2025-06-15 00:34:00.641856
129	user28	$2b$10$Nt4UA5t8HbF7S7YI9PqWeOkV84Hy0yKu7JJ5008eee22DDLCwMfIe	runnerup	1	2025-06-15 00:34:00.641856
130	user29	$2b$10$Hk5fm3zUGUhq5FlKROfo1.QxpZj84QoT2VfV91KjQWxBHRhRoCGSu	sweet22	1	2025-06-15 00:34:00.641856
131	user30	$2b$10$Ku1l4EariTstn8u0rk5GMeDIsaLPy0wsxGeXXbCAwCbVsh6Udm/x6	coolman1	1	2025-06-15 00:34:00.641856
132	user31	$2b$10$W0oRYFlvus.t.NS.4mEOo.Bakt2JXkv7HLm0t3zA/2H8kZGVMi7Da	summer55	1	2025-06-15 00:34:00.641856
133	user32	$2b$10$sgTOoIL.yNIqY.jiZ4sJLePrWyUfk/0Zw3x82BBb.AKmToavUj7zO	spring66	1	2025-06-15 00:34:00.641856
134	user33	$2b$10$nc6WrLaqtlOj4l02bnX1Qe.wVf6oL1YhvQ..u1/5KfjEV4AHG8y/G	winter44	1	2025-06-15 00:34:00.641856
135	user34	$2b$10$kzK6RoUnoLNKCYBeu/kQ1Oi03oOAneiHb90AqfyCfDnnCsx/gVFHq	autumn99	1	2025-06-15 00:34:00.641856
136	user35	$2b$10$bHeIrf5un8KnXsewGjOIau3iqpsozWDwdL73DhvY1NORWsm7fsdci	dance88	1	2025-06-15 00:34:00.641856
137	user36	$2b$10$l/LxrEBoAnWIOjrEUd6EXeWBA0Xwe9c8WTue4y1BeCNCVcIyMS2Am	yoga777	1	2025-06-15 00:34:00.641856
138	user37	$2b$10$8iNRtSd5BBx.dFkA9rGyluXNIm9q21WUVF.k5aWnzb95EEi826TPm	chef999	1	2025-06-15 00:34:00.641856
139	user38	$2b$10$hjTb9xZDSHbHL0nmzU.4RuFbk5lk2KbL1ILcYg8Q1NUvh/aJwS.x.	explorer	1	2025-06-15 00:34:00.641856
140	user39	$2b$10$nckzH4Sfj/oEhGAQGepCNO1.CWzetGONqOruiMEkTTRO8VzNdsICC	nature22	1	2025-06-15 00:34:00.641856
141	user40	$2b$10$bGoBLao67JGvc5S7EG.TZ.8ys2mdPqUaypY7b5VgtnCEt4ji89.be	writer11	1	2025-06-15 00:34:00.641856
142	user41	$2b$10$/yXPN1.EntrrxaA/SMLHc.ZIHWDO9D1419Ms3dWAdP9St4Xj0efTe	hero777	1	2025-06-15 00:34:00.641856
143	user42	$2b$10$i0SbF6gYHvSr2SqfReDbG.5JOO9rXVzYOP5uH1IE76tkVPQSWKC/S	game999	1	2025-06-15 00:34:00.641856
144	user43	$2b$10$jTF/OSWgZqYiOyyQwZFHFeXpJNYSz2C5x7GILJePGFZQgRFmIFgOm	jazzman	1	2025-06-15 00:34:00.641856
145	user44	$2b$10$59SH7ykMkzIsUcbiQ5vDTuL9tYpyhgKLckKFvku3LFXZhA8STzjiW	smile88	1	2025-06-15 00:34:00.641856
146	user45	$2b$10$i2TZFf222o589yDreGozgeA6QvBdu8VWEMGnm0L9juqE/DVwXvhyy	fashion21	1	2025-06-15 00:34:00.641856
147	user46	$2b$10$S8yU1Aq2Q8AnkA8ET1KAeO9cA860AzxwP5vjWeq8/.ZnYj8g13CaS	sport888	1	2025-06-15 00:34:00.641856
148	user47	$2b$10$QdCL87tf0HnwPs9LWiBN6evmya3uyV9QUJ/byOHGJquq8w51Rny6G	dream77	1	2025-06-15 00:34:00.641856
149	user48	$2b$10$PPgWZiJ889XbiXYz7TmtG.CCJuuxqsL17aKnoJk9fGLyF9T6LWC7K	sunshine	1	2025-06-15 00:34:00.641856
150	user49	$2b$10$Xq6tXuhaZJP540981zrMmOMextxhb.6XwrBks1dTadAlDcF5Xlj0G	energy77	1	2025-06-15 00:34:00.641856
151	user50	$2b$10$XheYZB1phX7jiKdPhtEGYOnWPLSHP7uh7NJcpek4i/yDGISf5rjse	magic999	1	2025-06-15 00:34:00.641856
152	user1	$2b$10$e678Xf3zZmoH0Lu4ijFXXe1rj0bDE6XO.QowkKdQbPDDhrAnxU3em	pass123	1	2025-06-15 00:34:00.641856
153	user2	$2b$10$buYzRNaGIdAT46GO6Ru5H.0c.DYWwBAyhe6B8mpuGAH7hIoZ1nJFq	apple2024	1	2025-06-15 00:34:00.641856
154	user3	$2b$10$ukNJqOMsW3UMpgmszEJZZOavgIIP9DBIkgtJQ4aWU11hlddbZixX2	hello321	1	2025-06-15 00:34:00.641856
155	user4	$2b$10$6KRVH/8lpQlJMAZjj0fipe.3LrgC9iaWrktm5QGisGzK.6pq3oAg.	snowman11	1	2025-06-15 00:34:00.641856
156	user5	$2b$10$LZF2iLUo3rlkp6j6qgEwk.DVv2A.rYsmoqH6lK61lBS1I9ig.Qkue	sun6789	1	2025-06-15 00:34:00.641856
157	user6	$2b$10$rhhfqJuHbiV.YNAv09PFZuyeAqEmlcLTHMpRP4wHSPd2C5tNBDccS	music123	1	2025-06-15 00:34:00.641856
158	user7	$2b$10$uXk6K2ggr/8Nf87nbRlcFemmhkFfnPvVIEgTi9/Yl5qiSQh8nS4tS	fashion99	1	2025-06-15 00:34:00.641856
159	user8	$2b$10$JCeg921cjh23iO40aPHD1.3y5ylCkPQuKMYa5C70JAUdYYEyzcJx2	runner88	1	2025-06-15 00:34:00.641856
160	user9	$2b$10$V91kB3LWiY.ttYWJWR5zoeC/zhnXW1Dmi50Ctcm.gLopu0m7dKNla	drawme56	1	2025-06-15 00:34:00.641856
161	user10	$2b$10$lKEf9K0H9sT4P2/1frstOOj2g.GtenyEUrF5kfI.g/ei3NAjXQz2a	12design	1	2025-06-15 00:34:00.641856
162	user11	$2b$10$U3jDL.KiEF010WDRO87J7uI0t2PjuuiK2WAYyQnGJSL0QQIQwyOsS	catlove	1	2025-06-15 00:34:00.641856
163	user12	$2b$10$t5cBhaHtFdM7/J2UbYfOO..bnmcFrb7M5W0YpGIP5KdeKaVr8DDYW	ocean77	1	2025-06-15 00:34:00.641856
164	user13	$2b$10$zePZTHo9KZ6XOfvc3VpTROEcv5586THNblxcnDlm4j5QXNodC5pJ.	flower88	1	2025-06-15 00:34:00.641856
165	user14	$2b$10$N0jCS5eIoKboZcogGSXCTu73S2Q4wmQzBB5ZgdU3WPqS82vDmOxO6	sky555	1	2025-06-15 00:34:00.641856
166	user15	$2b$10$z59FOCCmDXAR31bIjYpMuuHERVWlUhgdH8BezDLwrWn98mYfsxEHu	dreamer	1	2025-06-15 00:34:00.641856
167	user16	$2b$10$rVuEEx4QzOLYMQlOfP.pwuDEyDyiokJEk4rdZAHzRTcZKwKS.lW06	moonlight	1	2025-06-15 00:34:00.641856
168	user17	$2b$10$L2hSaibde3sYjoK9Hua0U.JAItsPkphlHaeVT49CkNOh/0QJZRE/C	star999	1	2025-06-15 00:34:00.641856
169	user18	$2b$10$YAGXJtXij0drimxFnNMvBuutGZQh61IT5moBdNFeuj7kNHlIe2pna	guitar321	1	2025-06-15 00:34:00.641856
170	user19	$2b$10$32l.QSI4L5lnVGLChiF7LOJXzXiQNxSd0KFQIBNZOXEUtWrvLYzkC	happy333	1	2025-06-15 00:34:00.641856
171	user20	$2b$10$s0AkOXvfGObcCieHE6siA.vlEsIGZC8VYmB88SFwCiWcS1cj9eE7K	code888	1	2025-06-15 00:34:00.641856
172	user21	$2b$10$sOC0F04cDaubPagVwZ/8kO4IPoe9lNOIFy73jG8trfc/VbEDQVD5m	zen123	1	2025-06-15 00:34:00.641856
173	user22	$2b$10$hituu.1s2GqSaFZhu9tD2OYK.gXiq28EA8uCqUGmXIGqKsvgDeuSy	piano456	1	2025-06-15 00:34:00.641856
174	user23	$2b$10$a2MSerDMkxqaZeTxo8vV1eIYlnWm/3Kitx1cvl1rSPTwr.pzVt0GK	travel77	1	2025-06-15 00:34:00.641856
175	user24	$2b$10$UE2N8f9FyOBJUxSg7DtO5OZcHk91CNH7s5Sw7Wab5.SN.1ayAvnde	movie555	1	2025-06-15 00:34:00.641856
176	user25	$2b$10$zSnOl8exLV5ex/n61pbO9uEnBnZnR8zpQLkLB29r5.qPB.KtkomYa	coffee999	1	2025-06-15 00:34:00.641856
177	user26	$2b$10$wRz.m33ZNmppC4VksKHqO.6..JxHu.azXBzsyd2UThsxxRaQ2QaQ.	artlover	1	2025-06-15 00:34:00.641856
178	user27	$2b$10$DVbhqty2hnlDwLIRX5.nDenw6j.pm6H6OUgNGrILcI5EuisSzkhzC	bookworm	1	2025-06-15 00:34:00.641856
179	user28	$2b$10$kyZq.kqOiqq6.PsquwyLxeSV/0sFKA4W2Va9D139Vv1.O0QZkKOfG	runnerup	1	2025-06-15 00:34:00.641856
180	user29	$2b$10$U6dt5xlUY5oNqHLZdMg8tulwSifBH1ki2Ojp63EAFr64pZzb8OXcC	sweet22	1	2025-06-15 00:34:00.641856
181	user30	$2b$10$Vs1qrQ6UcFm4FMZ2LTBEHealCcjA/NOGLrI.mHRp.rijEh1h.zrSq	coolman1	1	2025-06-15 00:34:00.641856
182	user31	$2b$10$5ztYM44Lug4mSYUelDEYU.Sjn4sbuFsEZM1XNlH2YHivOdAWI5wIW	summer55	1	2025-06-15 00:34:00.641856
183	user32	$2b$10$szumRAuHHxARirH3WiL2s.1iXm8Y1tL/xb1uxwOZsLAD6S3ArXIgy	spring66	1	2025-06-15 00:34:00.641856
184	user33	$2b$10$YBSBlkqwhHRJQlafp8mgxu89pKxVAEJRYsCMhHIasuoaksOYaG.wu	winter44	1	2025-06-15 00:34:00.641856
185	user34	$2b$10$9.QVf.DgAs8PvNDjOcnjMOz52CnFz5kGY2maFoxX7hLVYGVwy7BTS	autumn99	1	2025-06-15 00:34:00.641856
186	user35	$2b$10$Bp.21vIVg04K53.2.7lVp.nws36etjyiHeuPFnB1OkxpcLqmo1psy	dance88	1	2025-06-15 00:34:00.641856
187	user36	$2b$10$bl7hWUVRyTQb6dxGVebmB.6Aq1zynx59SfeFM/8Ps2NYPZuP2LKJy	yoga777	1	2025-06-15 00:34:00.641856
188	user37	$2b$10$7jePzF27d8WECnDRUHb90uuMe17Zov0FqqaSO2C9i0T1.NiYZe0Zy	chef999	1	2025-06-15 00:34:00.641856
189	user38	$2b$10$dKSjuAvJ5zV1L544tMf96uRKkqkM4LrjIV5zB5kw4Iy2K9C/8zktG	explorer	1	2025-06-15 00:34:00.641856
190	user39	$2b$10$alKipLcc9UMLNZEjz3yhVe/4hrZIs132IX15J8AYYohhyM36KqCFK	nature22	1	2025-06-15 00:34:00.641856
191	user40	$2b$10$q9BOL.5PWAIW9eGwQlVWZeu/0DjCnupTsTonAEV8hBLs3gg5GEUSq	writer11	1	2025-06-15 00:34:00.641856
192	user41	$2b$10$QQ77wfWuy9W6tcowlzI2xOvVCMMbrFUx1VvaSUdiuUCxG53at89a2	hero777	1	2025-06-15 00:34:00.641856
193	user42	$2b$10$S/Mby.KYxXVN3k72d5AGgebGrktOEmO/emRf2C78GLHYhBkgJOU5e	game999	1	2025-06-15 00:34:00.641856
194	user43	$2b$10$dDzTMi238clAJi9kYlOxtuPE97PBHgrXurWEKOvhPbsgjLI/pkvci	jazzman	1	2025-06-15 00:34:00.641856
195	user44	$2b$10$Oy7DDNX7Y2lcXw8EROyZouy/O4uEfIL5f5cabLcFVnO.SLqsi0FxW	smile88	1	2025-06-15 00:34:00.641856
196	user45	$2b$10$obCd.lrZM0s/N2VBvWvcF.7pEuZK3k92OYviDo1UYdUrZgPjRIgAm	fashion21	1	2025-06-15 00:34:00.641856
197	user46	$2b$10$AXb9p13H5Z4vHXw6OflVaeT3SAQsXjL1AASY56KchPN/XxW1iIooW	sport888	1	2025-06-15 00:34:00.641856
198	user47	$2b$10$nc1fFhsrsfsTJTU9aisRVu7lzgcN6SrTPDxKkp21qd94HJtV/gXZa	dream77	1	2025-06-15 00:34:00.641856
199	user48	$2b$10$0Gi.S00xNCyRH4u6D0a7xu.fmL/VPlDAfm4TYuwoIjZ4O6oYyscKi	sunshine	1	2025-06-15 00:34:00.641856
200	user49	$2b$10$5xUni5fG5yvYV3k9LLVW5OaxckNn60rzJTbeAXEj58TU/IVSaIzNS	energy77	1	2025-06-15 00:34:00.641856
201	user50	$2b$10$nxKvtHQB5XgfmFFCfAG4xe.dy4.W3S/K2C9PuB2FAFEWhmalzVXIS	magic999	1	2025-06-15 00:34:00.641856
204	una	$2b$10$Ugb.7BB7w92y9bhKRIt3bOSdnfoHrW6nbjcKuFB/wuQTXJQzU.3ey	eric0410	1	2025-06-15 00:34:00.641856
205	wendy	$2b$10$.XmX2P0gz9rFFQBUrxlY5eAWODCXzlZiazRPnRJ2Q59gKtyMmhAf.	eric0410	1	2025-06-15 00:34:00.641856
202	melody	$2b$10$Qm.P0pH1VArwayGdjA4oS.i5kUalgKcST8wKT4FX2UXuFdLSNVcyu	eric0410	2	2025-06-15 00:34:00.641856
206	ruby	$2b$10$/0aIIjMZkAz5a9CFqnExSuEMS0MLvpcSxX2Ti5Ifl2mXDhkbQfX/2	eric0410	1	2025-06-15 00:34:00.641856
203	eric	$2b$10$V6vp8quvihYw4lTRipHb8OhPUWN34ZwCE/yGZwjLnxx8x8i2g7Bu6	eric0410	2	2025-06-15 00:34:00.641856
207	sushi	$2b$10$aEkLlRr3ylcWTAU9ywq0zuDQEUD.Ed34WL0xRGoXnJYFNd6Q4AkIO	eric0410	2	2025-06-15 00:34:00.641856
208	tommy	$2b$10$7n.1.xPuzUhaVYOTgvKZB.Mgvr6klo7O0Gm9d5mv1ur/WMfQW8TW.	eric0410	1	2025-06-15 00:34:00.641856
209	star	$2b$10$zyFgnEYBZ1r1jGJ13GkF0.cZXZIQDVmM5tDh0a.a6CkgHUEsdctTS	eric0410	2	2025-06-15 00:34:00.641856
210	Grace	$2b$10$94lPtDQvvbA7wkCh3GS0duLwLSXoE8DVekyW.Ha18b6pFqYKZGziW	123456a	1	2025-06-15 00:34:00.641856
212	ericlin66.cs11@nycu.edu.tw			1	2025-06-14 16:59:18.225
211	123456	$2b$10$jNJrZWitSUESPPfqQzGCfO0JUpzCxhi5/P8lcFCrTzEV70UyHhGC.	1qaz2wsx	1	2025-06-15 00:34:00.641856
213	melody880306@gmail.com			1	2025-06-14 17:02:17.638
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activities_id_seq', 10, true);


--
-- Name: gift_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gift_orders_id_seq', 98, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 231, true);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.photos_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 2, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 49, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 213, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: gift_orders gift_orders_order_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_orders
    ADD CONSTRAINT gift_orders_order_id_unique UNIQUE (order_id);


--
-- Name: gift_orders gift_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_orders
    ADD CONSTRAINT gift_orders_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_merchanttradeno_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_merchanttradeno_key UNIQUE (merchanttradeno);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: gift_orders gift_orders_receiver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_orders
    ADD CONSTRAINT gift_orders_receiver_id_users_id_fk FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: gift_orders gift_orders_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_orders
    ADD CONSTRAINT gift_orders_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_gift_order_id_gift_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_gift_order_id_gift_orders_id_fk FOREIGN KEY (gift_order_id) REFERENCES public.gift_orders(id);


--
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: profiles profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

