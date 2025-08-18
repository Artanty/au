зачем нужен

при сохранении записи (как запись привязывается к пользователю):
1. к моменту сохранения ентити имеем на бэке note@ токен юзера.
этот токен состоит из:
- ид юзера
- ид провайдера (если есть)

2. при сохранении записи идет сохранение самой записи - таблица note@notes
3. при сохранении записи идет сохранение связки запись-юзер - таблица note@note2user
в качестве юзера должно быть что-то больше, чем id
потому что при подключении другой дб юзеров - id может совпасть.
а note@ об этом ничего не знает.
нужно ли прокидывать в note@note2user также userListSource? получается, что да.


### при запросе в другой микроервис
берем ключ из key@back
1. делаем запрос с:
```
headers: {
        'X-Project-Id': process.env.PROJECT_ID, // e.g. 'au@back'
        'X-Project-Domain-Name': requesterUrl,
        'X-Api-Key': process.env.BASE_KEY
      }
```
2. получаем ответ:
```
{ 
    apiKey: string, // backendServiceToken
    expiresAt: string
}
```

### при запросе для записи (saveTemp)
добавляем headers:
```
headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendServiceToken.token}`,
          'X-Requester-Project': process.env.PROJECT_ID,
          'X-Requester-Url': `${req.protocol}://${req.get('host')}`
        },
```





### что должно быть в конфиге?
```
const busEvent: BusEvent = {
  from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
  to: `${res.from}`,
  event: 'AUTH_CONFIG',
  payload: {
    authStrategy: 'BACKEND_TOKEN',
    tokenShareStrategy: 'SAVE_TEMP_DUPLICATE',
    hostOrigin: window.location.origin,
    hostName: string,
    hostVersion: string
  },
};
```


### как будет провайдиться конфиг (хардкод в хосте) и какой сервис будет его обрабатывать и применять (au@)?
конфиг лежит в БД, в момент билда хоста он доступен.
есть ли бэк у хоста? не хотелось бы, почему? это связывание и централизация, не хочу связывать.
у хоста есть только фронт, что если отдавать конфиг через фронт?
- он сейчас и так на фронте и есть механизм в au@ применяющий его. он ниче, оставляю.
можно ли изменить конфиг хоста когда он уже развернут? да
для этого его придется пересобрать? сейчас да. в идеале - надо думать. скорее да.
сложность:
хост (фронт) должен получить новое состояние из БД.
сокеты и тд - не хочу.
регулярный опрос чего-то - не хочу.
самый дешевый способ получить обновление для хоста - перебилдить его. 
поэтому нет смысла запрашивать конфиг в рантайме.
к моменту рантайма конфиг будет захардкожен в него.

### todo next
1. прочекать login+tokenShare
раздаем token+userHandler
hostOrigin только для пути файла.


CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `password_reset_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `used` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token` (`token`),
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `user_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_session_token` (`token`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role_id` INT NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_role_role` FOREIGN KEY (`role_id`) 
    REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Main providers table
CREATE TABLE `providers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT 'azure, okta, hr_db',
  `provider_type` ENUM('oidc', 'saml', 'jwt', 'external_db') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_provider_name` (`name`)
) ENGINE=InnoDB;

-- Config for external_db provider
CREATE TABLE `provider_configs` (
  `provider_id` BIGINT NOT NULL,
  `config_key` VARCHAR(50) NOT NULL,
  `config_value` TEXT NOT NULL,
  `is_secret` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`provider_id`, `config_key`),
  FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Field remapping
CREATE TABLE `provider_mappings` (
  `provider_id` BIGINT NOT NULL,
  `external_field` VARCHAR(100) NOT NULL,
  `internal_claim` VARCHAR(50) NOT NULL COMMENT 'id, email, name',
  `transform` VARCHAR(30) DEFAULT 'none',
  PRIMARY KEY (`provider_id`, `external_field`),
  FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

## TESTING EXTERNAL USERS DATABASE

### create and populate table in extarnal db

CREATE TABLE `staff_members` (
  `employee_code` VARCHAR(20) PRIMARY KEY,
  `company_email` VARCHAR(100) UNIQUE NOT NULL,
  `complete_name` VARCHAR(100) NOT NULL,
  `job_title` VARCHAR(50),
  `security_hash` CHAR(64) NOT NULL COMMENT 'SHA-256',
  `employment_start` DATE NOT NULL
) ENGINE=InnoDB;

INSERT INTO staff_members (
  employee_code, 
  company_email, 
  complete_name, 
  job_title, 
  security_hash, 
  employment_start
) VALUES (
  'TEST-001',
  'test.user@company.com',
  'Test User',
  'QA Tester',
  SHA2('testpassword123', 256),  -- Storing hashed password
  CURDATE()
);

### add external database as a provider

-- Add external DB provider
INSERT INTO providers
(name, provider_type)
VALUES('acme_hr', 'external_db');

### add provider's config

INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'db_host', 'xx.xx.xx.xxx', 0);
INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'db_name', 'test', 0);
INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'db_password', 'xxxxxxxxxxxxxxxxxxxxxxx', 1);
INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'db_port', '3306', 0);
INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'db_user', 'test', 1);
INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'id_column', 'employee_code', 0);
INSERT INTO provider_configs
(provider_id, config_key, config_value, is_secret)
VALUES(1, 'user_table', 'staff_members', 0);

### add provider's mappings

INSERT INTO provider_mappings
(provider_id, external_field, internal_claim, `transform`)
VALUES(1, 'company_email', 'email', 'lowercase');
INSERT INTO provider_mappings
(provider_id, external_field, internal_claim, `transform`)
VALUES(1, 'complete_name', 'name', 'trim');
INSERT INTO provider_mappings
(provider_id, external_field, internal_claim, `transform`)
VALUES(1, 'employee_code', 'id', 'none');
INSERT INTO provider_mappings
(provider_id, external_field, internal_claim, `transform`)
VALUES(1, 'job_title', 'position', 'none');
INSERT INTO provider_mappings
(provider_id, external_field, internal_claim, `transform`)
VALUES(1, 'security_hash', 'password_hash', 'none');


### external user login check api

{{USER_back_domain}}/api/users/login
{
  "email": "test.user@company.com",
  "password": "testpassword123",
  "provider": "acme_hr"
}