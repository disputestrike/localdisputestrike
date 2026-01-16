-- IdentityIQ Payment Tracking
CREATE TABLE IF NOT EXISTS identityiq_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subscription_id INT,
  payment_type ENUM('trial', 'monthly') NOT NULL,
  amount_cents INT NOT NULL,
  status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  identityiq_transaction_id VARCHAR(255),
  paid_at TIMESTAMP NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
