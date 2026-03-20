--
-- PostgreSQL database dump
--

\restrict BSDvaMlrL4rKb2gbvLib1SaIaHfkgi6RhoW4Ave3G4A4b9GjatpgvTfxSe1HAyf

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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

ALTER TABLE IF EXISTS ONLY public.jaime DROP CONSTRAINT IF EXISTS jaime_id_fkey;
ALTER TABLE IF EXISTS ONLY public.jaime DROP CONSTRAINT IF EXISTS jaime_id_avis_fkey;
ALTER TABLE IF EXISTS ONLY public.commente DROP CONSTRAINT IF EXISTS commente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.commente DROP CONSTRAINT IF EXISTS commente_id_avis_fkey;
ALTER TABLE IF EXISTS ONLY public.avis DROP CONSTRAINT IF EXISTS avis_id_fkey;
ALTER TABLE IF EXISTS ONLY public.utilisateur DROP CONSTRAINT IF EXISTS utilisateur_pkey;
ALTER TABLE IF EXISTS ONLY public.jaime DROP CONSTRAINT IF EXISTS jaime_pkey;
ALTER TABLE IF EXISTS ONLY public.commente DROP CONSTRAINT IF EXISTS commente_pkey;
ALTER TABLE IF EXISTS ONLY public.avis DROP CONSTRAINT IF EXISTS avis_pkey;
DROP TABLE IF EXISTS public.utilisateur;
DROP TABLE IF EXISTS public.jaime;
DROP TABLE IF EXISTS public.commente;
DROP TABLE IF EXISTS public.avis;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: avis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avis (
    id_avis uuid NOT NULL,
    stars numeric(2,1),
    nom_jeu character varying(50),
    nombre_heures integer,
    titre text,
    message text,
    date_creation date,
    id uuid NOT NULL
);


--
-- Name: commente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commente (
    id uuid NOT NULL,
    id_avis uuid NOT NULL,
    id_com uuid,
    message character varying(300),
    date_com timestamp without time zone
);


--
-- Name: jaime; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jaime (
    id uuid NOT NULL,
    id_avis uuid NOT NULL,
    date_like date
);


--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateur (
    id uuid NOT NULL,
    pseudo character varying(50),
    email character varying(50),
    password character varying(255),
    is_admin boolean
);


--
-- Data for Name: avis; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('3bf3e6f1-12e9-4f91-aa7f-64f2eb14ec83', 5.0, 'Elden Ring', 200, 'Le meilleur jeu de tout les temps ?', 'Les décors sont superbes et l''aventure incroyable, je le recommande fortement !', '2026-03-20', 'f3f4d193-d839-4d08-bba5-522a26721c81');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('8911092a-47d7-4b65-acdd-cd9e6d632175', 3.0, 'Final Fantasy 32', 30, 'Bon...', 'Ca devient répétitif ce 32ème opus, je ne suis pas sûr de recommander celui la...', '2026-03-20', 'f3f4d193-d839-4d08-bba5-522a26721c81');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('633cea79-4c9c-45f3-b489-7d4e5eaaea09', 1.0, 'Honkai Star Rail (HSR)', 1000, 'Ce jeu est un casino caché', 'Les gars, ne jouez surtout pas, j''ai perdu beaucoup trop d''argent sur cette nullitée sans nom', '2026-03-20', 'f3f4d193-d839-4d08-bba5-522a26721c81');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('31bec147-2513-4a6d-8fb9-a2da896856e5', 4.0, 'Celeste', 60, 'Un plateforme formidable', 'Ce jeu plateformer est incroyable avec sa DA et ses dessins fou, il y a une vraie expérience avec ce jeu, je vous le recommande tellement !!!', '2026-03-20', 'f3f4d193-d839-4d08-bba5-522a26721c81');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('8f81409a-876b-4385-a3f5-f3591a482b7b', 5.0, 'avis a supr pour test admin', 0, 'test', 'test', '2026-03-20', 'f3f4d193-d839-4d08-bba5-522a26721c81');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('96eae2c5-c882-4423-8a13-e03c3a7262ba', 4.5, 'Uncharted 3', 100, 'Le meilleurs opus de la saga ! et de loin', 'Les gars il faut jouer à ce jeu et son mode histoire, c''est vraiment génial de se retrouver dans la peau d''un chercheur de trésor avec toutes ses péripécies !!', '2026-03-20', '1e905250-553f-4f15-b1b2-b99be312e277');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('a5a5b754-7867-46ac-b4d5-ae2caf14436b', 2.0, 'Valorant', 200, 'CSGO en moins bien ?', 'Tout simplement moins bon que counter strike, avec un gameplay brouillon, et une commu toxique et assez jeune', '2026-03-20', '1e905250-553f-4f15-b1b2-b99be312e277');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('6c53782b-1cf5-4bad-a564-808352274788', 5.0, 'Rust', 1050, 'Le meilleurs jeux de survie PVP', 'Tuer un Russe tout nu sur la plage ? Le looter, construire une base, Raid une autre base, se faire raid et repartir de 0, tout nu, sur la plage, un pur jeu de survie !! acheter le en promo par contre !', '2026-03-20', '1e905250-553f-4f15-b1b2-b99be312e277');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('b72dc672-24c9-41ec-a0ac-6b6018e4a9fe', 5.0, 'Minecraft', 3000, 'Que dire...', 'Le jeu est le plus vendu de tout les temps, il est indémodable et l''amusement ainsi que les possibilitées sont infinies !!! encore plus avec les mods, la communauté fait évoluer le jeu c''est incroyable !!', '2026-03-20', '896a961b-861f-4aa9-8d6d-93bba7bd857c');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('8734ea19-566d-474c-b863-a8d2eb0b75c8', 3.0, 'Paladium', 53, 'Un nouveau modpack COMPLET', 'Le nouveau serveur paladium francais avec le modpack paladium est vraiment sympa mais il faut aimer le pvp ... ! je recommande pour les amateurs de ce type de gameplay', '2026-03-20', '896a961b-861f-4aa9-8d6d-93bba7bd857c');
INSERT INTO public.avis (id_avis, stars, nom_jeu, nombre_heures, titre, message, date_creation, id) VALUES ('046d14ad-fbf7-4718-a568-4cfa0db3b0b2', 1.0, 'Roblox', 5, 'Une fraude :''|', 'une copie tout simplement naze de minecraft ! honte, procès !!', '2026-03-20', '896a961b-861f-4aa9-8d6d-93bba7bd857c');


--
-- Data for Name: commente; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '31bec147-2513-4a6d-8fb9-a2da896856e5', 'd70511b1-3373-417a-a788-fcfdd1215ba0', 'Mouais, je ne suis pas tout à fait convaincu par le gameplay...', '2026-03-20 10:05:22.758575');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '3bf3e6f1-12e9-4f91-aa7f-64f2eb14ec83', '2ba08ddd-a02f-43cd-b666-04bf3d33eb5d', 'Ah ça !! tu l''as dis, je ne m''en lasserais jamais, moi aussi je le recommande à tous', '2026-03-20 10:06:11.374097');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '633cea79-4c9c-45f3-b489-7d4e5eaaea09', 'b2f93788-b0d8-4e57-a5a9-93af9ea8decd', 'Bien dis, j''ai toujours dis que c''était une daube, une tireuse à fric', '2026-03-20 10:06:36.376333');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '96eae2c5-c882-4423-8a13-e03c3a7262ba', 'c740c3c3-bfd1-4357-bbc2-c5532417f757', 'Les graphismes ont un peut veillis mais c''est tout à fait acceptable sur la playstation 3 !!!', '2026-03-20 10:09:09.280882');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '633cea79-4c9c-45f3-b489-7d4e5eaaea09', 'aa75e0ee-003c-461c-b095-3aaeea93ca53', 'C''est pour ça qu''il faut pas jouer aux jeux de Hoyoverse, c''est de l''arnaque...', '2026-03-20 10:16:35.832309');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '31bec147-2513-4a6d-8fb9-a2da896856e5', '52a5c17a-40f1-40e1-84ec-1681e577229b', 'Oui moi j''adore, faut pas écouter Edgar', '2026-03-20 10:16:55.183484');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '3bf3e6f1-12e9-4f91-aa7f-64f2eb14ec83', '2be5faf8-813c-4ed4-8f23-7500ea2c99ad', 'Mais ça à l''air trop dur, j''ai peur de me lancer', '2026-03-20 10:17:13.173911');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('f3f4d193-d839-4d08-bba5-522a26721c81', '6c53782b-1cf5-4bad-a564-808352274788', '02a49cb9-f109-40dc-982f-9a2fe274b744', 'Je suis trop vieux et nul pour ça... :''(', '2026-03-20 10:21:38.889125');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('57888409-783f-466f-9545-759e4a38b0f1', '633cea79-4c9c-45f3-b489-7d4e5eaaea09', 'b75f500f-182c-42d7-bcf4-3c842c65fbb5', 'OUI, MOI AUSSI J''AI DEPENSE 3678 EUROS SUR CETTE MERDE, ALEDDD', '2026-03-20 10:23:52.96719');
INSERT INTO public.commente (id, id_avis, id_com, message, date_com) VALUES ('57888409-783f-466f-9545-759e4a38b0f1', '046d14ad-fbf7-4718-a568-4cfa0db3b0b2', 'fccdb9da-2853-4f8f-9b09-81dfdab43a3b', 'MOI J''ADORE ROBLOXXX', '2026-03-20 10:24:19.343624');


--
-- Data for Name: jaime; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '3bf3e6f1-12e9-4f91-aa7f-64f2eb14ec83', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '633cea79-4c9c-45f3-b489-7d4e5eaaea09', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', '96eae2c5-c882-4423-8a13-e03c3a7262ba', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '31bec147-2513-4a6d-8fb9-a2da896856e5', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '3bf3e6f1-12e9-4f91-aa7f-64f2eb14ec83', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '633cea79-4c9c-45f3-b489-7d4e5eaaea09', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '6c53782b-1cf5-4bad-a564-808352274788', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '8911092a-47d7-4b65-acdd-cd9e6d632175', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', '96eae2c5-c882-4423-8a13-e03c3a7262ba', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', 'a5a5b754-7867-46ac-b4d5-ae2caf14436b', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', 'b72dc672-24c9-41ec-a0ac-6b6018e4a9fe', '2026-03-20');
INSERT INTO public.jaime (id, id_avis, date_like) VALUES ('57888409-783f-466f-9545-759e4a38b0f1', '046d14ad-fbf7-4718-a568-4cfa0db3b0b2', '2026-03-20');


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.utilisateur (id, pseudo, email, password, is_admin) VALUES ('1e905250-553f-4f15-b1b2-b99be312e277', 'Edgar', 'edgar.mlrd@gmail.com', '$2b$10$mTNvw7.b8SJreO3FMIsyuOnvdH7dn5QN87XOMlMqquOQSvejiQ18.', false);
INSERT INTO public.utilisateur (id, pseudo, email, password, is_admin) VALUES ('f3f4d193-d839-4d08-bba5-522a26721c81', 'Adnane', 'adnane@gmail.com', '$2b$10$n4r8Y9dyzFpvr2aiyCJlh.7XAH45782ZGF.gKpu7aws7gKxhDPrRC', false);
INSERT INTO public.utilisateur (id, pseudo, email, password, is_admin) VALUES ('896a961b-861f-4aa9-8d6d-93bba7bd857c', 'Samuel', 'samuel@test.com', '$2b$10$YSW49N7.puh1YA.Ln9I3sebIh3IOUuahScEko2ItQQuJVZrh7kzN2', false);
INSERT INTO public.utilisateur (id, pseudo, email, password, is_admin) VALUES ('57888409-783f-466f-9545-759e4a38b0f1', 'Hernani', 'hernani@neuil.com', '$2b$10$F8YzpEeanB3DlmmC9HhvF.R1hRRNfk5l39EReGt3x86SS3TvXnVSm', false);
INSERT INTO public.utilisateur (id, pseudo, email, password, is_admin) VALUES ('e7ce2b9f-1dc1-41b8-aa6c-74781c94b12d', 'Admin', 'admin@admin.fr', '$2b$10$XbHUwizflFLAyUyHscL3LuTgWLnG2jxKW2v0QNSgEQjeSzfzBLfjq', true);


--
-- Name: avis avis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_pkey PRIMARY KEY (id_avis);


--
-- Name: commente commente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commente
    ADD CONSTRAINT commente_pkey PRIMARY KEY (id, id_avis);


--
-- Name: jaime jaime_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jaime
    ADD CONSTRAINT jaime_pkey PRIMARY KEY (id, id_avis);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);


--
-- Name: avis avis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_id_fkey FOREIGN KEY (id) REFERENCES public.utilisateur(id);


--
-- Name: commente commente_id_avis_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commente
    ADD CONSTRAINT commente_id_avis_fkey FOREIGN KEY (id_avis) REFERENCES public.avis(id_avis);


--
-- Name: commente commente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commente
    ADD CONSTRAINT commente_id_fkey FOREIGN KEY (id) REFERENCES public.utilisateur(id);


--
-- Name: jaime jaime_id_avis_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jaime
    ADD CONSTRAINT jaime_id_avis_fkey FOREIGN KEY (id_avis) REFERENCES public.avis(id_avis);


--
-- Name: jaime jaime_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jaime
    ADD CONSTRAINT jaime_id_fkey FOREIGN KEY (id) REFERENCES public.utilisateur(id);


--
-- PostgreSQL database dump complete
--

\unrestrict BSDvaMlrL4rKb2gbvLib1SaIaHfkgi6RhoW4Ave3G4A4b9GjatpgvTfxSe1HAyf

