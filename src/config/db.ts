import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: config.connection_str,
});

export const initDB = async () => {
  if (!config.connection_str) {
    console.log("No CONNECTION_STR, skipping DB init");
    return;
  }

  await pool.query(/* SQL */ `
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone VARCHAR(250) NOT NULL,
    role VARCHAR(100) NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    `);

  await pool.query(/* SQL */ `
    CREATE TABLE IF NOT EXISTS vehicles(
    id SERIAL PRIMARY KEY,
    vehicle_name VARCHAR(250) NOT NULL,
    type VARCHAR(250),
    registration_number VARCHAR(50) UNIQUE NOT NULL ,
    daily_rent_price INT NOT NULL CHECK (daily_rent_price > 0),
    availability_status VARCHAR(250)
    )
    `);

  await pool.query(/* SQL */ `
    CREATE TABLE IF NOT EXISTS bookings(
      id SERIAL PRIMARY KEY,
      customer_id INT NOT NULL,
      vehicle_id INT NOT NULL,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL,
      total_price INT NOT NULL CHECK (total_price > 0),
      status VARCHAR(50) DEFAULT 'active',
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
    `);
};