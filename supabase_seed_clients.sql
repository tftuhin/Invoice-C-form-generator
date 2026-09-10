-- =========================================================
-- Initial Seed Data: 21 Verified Clients
-- Run this in your Supabase SQL Editor if you ever need to re-seed
-- =========================================================

INSERT INTO clients (name, address, bank_name, bank_address)
VALUES
  ('Minerva Health Ventures LLC', '25420 Kuykendahl Rd, Ste. D400, Tomball, TX 77375', 'JPMorgan Chase Bank', '10665 Kuykendahl Rd, The Woodlands, TX  77382'),
  ('Paddle.com Market Ltd', 'Judd House 18-29 Mora Street London, EC1V 8BT, UK', 'Barclays Bank PLC', '1 Churchill Place, London E14 5HP.'),
  ('Simplify Workforce Inc', 'One Exchange Place, Suite 902, Jersey City, 07302 US NJ.', 'Bank Of America', 'National Association, 100 W 33rd St, 4th Fl'),
  ('Marc Hiltbrunner', 'ELIZA AG, Dammweg 9, 3013 Bern, Switzerland', 'Berner Kantonalbank AG', 'Bundesplatz 8, 3011 Bern, Switzerland'),
  ('Brandon Maytham', '247 the Cullerns, Highworth, Swindon, SN6 7NP United Kingdom', 'Monzo BanK', 'Broadwalk House, 5 Appold St, London, EC2A 2AG, United Kingdom'),
  ('Envato Pty Ltd', '121 King Street, Melbourne Victoria 3000, Australia', 'HSBC UK BANK PLC', '1 CENTENARY SQUARE, BIRMINGHAM, United Kingdom'),
  ('TRUESTREAM', 'Teknikringen 8D 583 30, Linköping, Östergötland Sweden', 'Monzo BanK', 'Broadwalk House, 5 Appold St, London, EC2A 2AG, United Kingdom'),
  ('PASCOM GMBH & CO. KG', 'Berger Str 42 94469 Deggendorf Deutschland', '', ''),
  ('GRAND HOTEL KURHAUS AROLLA SA', 'ROUTE DE LA FORET 6, 1986 AROLLA, CH', 'STANDARD CHARTERED BANK', '1095 AVENUE OF THE AMERICAS'),
  ('SUPERNOVA GROUP LLC', '640, POINCIANA DRIVE FORT, LAUDERDALE FL 33301 US', 'JPMorgan Chase Bank N.A.', '383 MADISON AVENUE, NEW YORK, US'),
  ('SECDEV GROUP CORP', 'SUITE 300, 950 GLADSTONE AVENUE, OTTAWA, ON K1Y3E6, CA', 'ROYAL BANK OF CANADA', 'WELLINGTON STREET WEST, 180, TORONTO, CANADA.'),
  ('GETSETPET LTD', '85, GREAT PORTLAND STREET, FIRST FLOOR', 'BARCLAYS BANK PLC', '1 CHURCHILL PLACE, LONDON'),
  ('UDHARAM VASNANI VINOD', '56 02 41A BEDOK RIA CRESCENT, SG 489929 SG', 'JPMORGAN CHASE BANK, N.A.', '383 MADISON AVENUE, NEW YORK, US'),
  ('David Eggler', 'Zürs 126, 6763 Zürs, Austria', '', ''),
  ('Parkquility', '6365 Collins Ave, Miami Beach FL 33141, USA.', 'JPMORGAN CHASE BANK, N.A.', '383 MADISON AVENUE, NEW YORK, USA.'),
  ('MEDICAL RECORDS REFORM LLC', '13165 LAKE HOUSTON PARKWAY, HOUSTON TX, 77044 US', 'BARCLAYS BANK PLC', '1 Churchill Place, London E14 5HP.'),
  ('Bernhard Buhlmann', 'ELIZA AG, Dammweg 9, 3013 Bern, Switzerland', 'CITIBANK N.A.', '388 GREENWICH STREET388 GREENWICH STREET, NEW YORK, United States'),
  ('Upwork Global Inc.', '475 Brannan St., Suite 430, San Francisco, CA 94107, USA', 'WELLS FARGO BANK, N.A.', '420 MONTGOMERY STREET, SAN FRANCISCO, United States'),
  ('Brandbes LLC', '16192 Coastal Highway, Lewes, Delaware 19958 USA', 'BARCLAYS BANK PLC', '1 CHURCHILL PLACE, LONDON'),
  ('Humantellligence, Inc.', '1521 Alton Road, #109, Miami Beach FL 33139', '', ''),
  ('Oliver Scherrer', 'BrainRitual Picassopl. 4 4052 Basel, Switzerland', '', '')
ON CONFLICT DO NOTHING;
