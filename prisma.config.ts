import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    url: "postgresql://postgres.ljxmrcpudkqtvspusvgi:TirtaAsri0209@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  },
});
