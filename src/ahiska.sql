-- Delete and recreate ahiskaDB
DROP DATABASE ahiskaDB;
CREATE DATABASE ahiskaDB;
\connect ahiskaDB

\i ahiska-schema.sql

-- Delete and recreate ahiskaDB_test
DROP DATABASE ahiskaDB_test;
CREATE DATABASE ahiskaDB_test;
\connect ahiskaDB_test

\i ahiska-schema.sql