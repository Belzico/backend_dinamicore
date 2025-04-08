-- Script: schema.sql

-- Create schema 
CREATE SCHEMA IF NOT EXISTS fintech;
SET search_path = fintech, public;

-- Table: Users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    -- Basic personal information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL, -- Password is stored securely (hashed)
    role VARCHAR(20) DEFAULT 'user', -- Role: user or admin

    -- Credit information
    credit_score INT,  -- Basic credit score
    credit_limit DECIMAL(10,2) DEFAULT 0,

    -- Security & auditing fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Wallets
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Table: Transactions
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    wallet_id INT NOT NULL,
    -- The wallet that receives in case of transfer (null for deposit/withdraw)
    wallet_id_dest INT,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    -- e.g. 'deposit', 'withdraw', 'transfer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_transactions_wallet
        FOREIGN KEY (wallet_id)
        REFERENCES wallets(wallet_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_wallet_dest
        FOREIGN KEY (wallet_id_dest)
        REFERENCES wallets(wallet_id)
        ON DELETE CASCADE
);

-- Table: Credits
CREATE TABLE IF NOT EXISTS credits (
    credit_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,

    CONSTRAINT fk_credits_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Table: Credit_Payments
CREATE TABLE IF NOT EXISTS credit_payments (
    payment_id SERIAL PRIMARY KEY,
    credit_id INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_credit_payments
        FOREIGN KEY (credit_id)
        REFERENCES credits(credit_id)
        ON DELETE CASCADE
);
