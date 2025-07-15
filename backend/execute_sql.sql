CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 
TRUNCATE TABLE "_prisma_migrations" CASCADE; 
UPDATE projects SET status = 'ACTIVE' WHERE status = 'ON_GOING'; 