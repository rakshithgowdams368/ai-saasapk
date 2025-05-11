// scripts/create-tables.ts
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function createTables() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in environment variables');
        return;
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('Creating tables...');

        // Create enums first
        await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan') THEN
          CREATE TYPE plan AS ENUM ('free', 'basic', 'pro');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
          CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
          CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
          CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved');
        END IF;
      END $$;
    `;

        // Create users table
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Users table created');

        // Create subscriptions table
        await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        plan plan NOT NULL DEFAULT 'free',
        status subscription_status NOT NULL DEFAULT 'active',
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        paypal_subscription_id TEXT,
        paypal_payer_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Subscriptions table created');

        // Create invoices table
        await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        subscription_id UUID REFERENCES subscriptions(id) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status invoice_status NOT NULL DEFAULT 'pending',
        paypal_payment_id TEXT,
        paypal_invoice_id TEXT,
        invoice_number TEXT NOT NULL UNIQUE,
        invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        paid_at TIMESTAMP WITH TIME ZONE,
        invoice_json JSONB NOT NULL,
        pdf_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Invoices table created');

        // Create image_generations table
        await sql`
      CREATE TABLE IF NOT EXISTS image_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        prompt TEXT NOT NULL,
        model TEXT NOT NULL,
        image_url TEXT NOT NULL,
        resolution TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Image generations table created');

        // Create video_generations table
        await sql`
      CREATE TABLE IF NOT EXISTS video_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        prompt TEXT NOT NULL,
        video_url TEXT NOT NULL,
        duration INTEGER,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Video generations table created');

        // Create audio_generations table
        await sql`
      CREATE TABLE IF NOT EXISTS audio_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        prompt TEXT NOT NULL,
        audio_url TEXT NOT NULL,
        duration INTEGER,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Audio generations table created');

        // Create code_generations table
        await sql`
      CREATE TABLE IF NOT EXISTS code_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        prompt TEXT NOT NULL,
        generated_code TEXT NOT NULL,
        language TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Code generations table created');

        // Create conversations table
        await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        messages JSONB NOT NULL,
        model TEXT NOT NULL,
        session_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Conversations table created');

        // Create user_settings table
        await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
        general JSONB NOT NULL,
        appearance JSONB NOT NULL,
        notifications JSONB NOT NULL,
        ai JSONB NOT NULL,
        privacy JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('User settings table created');

        // Create contact_messages table
        await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        status contact_status NOT NULL DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        console.log('Contact messages table created');

        console.log('All tables created successfully!');

        // Test the tables
        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
        console.log('Tables in database:', tables);

    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

createTables();