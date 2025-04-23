# Trading Management System (TMS)

## Description

This project is a comprehensive Trading Management System built using Spring Boot. It allows users to manage their stock portfolios, execute trades, track market news, and manage their accounts securely. The system features user authentication (including Google OAuth2), real-time trade execution simulation, portfolio tracking, watchlist management, and secure transaction handling.

## Features

- **User Authentication**: Secure registration and login using email/password and Google OAuth2. Includes JWT-based session management.
- **Profile Management**: Users can complete and update their profiles.
- **Account Verification**: OTP verification via Email and potentially SMS (Twilio integration).
- **Portfolio Management**: Track stock holdings, purchase prices, quantities, and overall portfolio value.
- **Trade Execution**: Simulate buying and selling stocks with price validation.
- **Transaction History**: View a detailed history of all trades and financial transactions.
- **Watchlist**: Add and manage a list of stocks to monitor.
- **Stock Data**: Integration with external APIs (like News API) to fetch stock information and market news.
- **Payment Integration**: Basic framework for handling deposits/withdrawals.
- **Security**: Implements security best practices including CSRF protection, CORS configuration, and secure password hashing.

## Technologies Used

- **Backend**: Java, Spring Boot, Spring Security, Spring Data JPA
- **Database**: MySQL (or configured database)
- **Authentication**: JWT, OAuth2 (Google)
- **Build Tool**: Gradle
- **Other Libraries**: Lombok, Spring Mail, Twilio (optional), RestTemplate

## Project Structure

```
demo2/
├── build.gradle              # Gradle build script
├── gradlew                   # Gradle wrapper script (Linux/macOS)
├── gradlew.bat               # Gradle wrapper script (Windows)
├── settings.gradle           # Gradle settings
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/demo/
│   │   │       ├── Demo2Application.java  # Main application entry point
│   │   │       ├── config/             # Spring configurations (Security, Mail, CORS, etc.)
│   │   │       ├── controller/         # REST API controllers
│   │   │       ├── dto/                # Data Transfer Objects
│   │   │       ├── exception/          # Custom exception classes
│   │   │       ├── model/              # JPA entities and domain models
│   │   │       ├── repository/         # Spring Data JPA repositories
│   │   │       ├── security/           # Security components (JWT, OAuth2 handlers, UserDetails)
│   │   │       └── service/            # Business logic services
│   │   └── resources/
│   │       ├── application.properties  # Main application configuration
│   │       └── application.yml         # Additional configuration (if used)
│   └── test/
│       └── java/
│           └── com/example/demo/     # Unit and integration tests
├── build/                    # Compiled code and build artifacts
└── gradle/                   # Gradle wrapper files
```

## Setup and Installation

1.  **Prerequisites**:

    - Java Development Kit (JDK) 17 or later
    - Gradle
    - MySQL Server (or another configured database)

2.  **Clone the Repository**:

    ```bash
    git clone <your-repository-url>
    cd demo2
    ```

3.  **Database Setup**:

    - Create a MySQL database (e.g., `tms_db`).
    - Update the database connection details in `src/main/resources/application.properties`:
      ```properties
      spring.datasource.url=jdbc:mysql://localhost:3306/tms_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      spring.datasource.username=<your-db-username>
      spring.datasource.password=<your-db-password>
      spring.jpa.hibernate.ddl-auto=update # Or 'validate'/'create' for initial setup
      ```

4.  **Configure External Services**:

    - **Google OAuth2**: Set up OAuth2 credentials in Google Cloud Console and add the client ID and secret to `application.properties`:
      ```properties
      spring.security.oauth2.client.registration.google.client-id=<your-google-client-id>
      spring.security.oauth2.client.registration.google.client-secret=<your-google-client-secret>
      ```
    - **JWT Secret**: Set a strong secret key for JWT generation:
      ```properties
      app.jwtSecret=<your-strong-jwt-secret>
      app.jwtExpirationInMs=<jwt-expiration-time-in-ms>
      ```
    - **Email (Gmail)**: Configure sender email credentials in `src/main/java/com/example/demo/config/JavaMailConfig.java` or move to `application.properties`.
    - **Twilio (Optional)**: If using SMS OTP, add Twilio credentials to `application.properties`.
    - **News API (Optional)**: Add your News API key if using the news feature.

5.  **Build the Project**:
    ```bash
    ./gradlew build
    ```
    (Use `gradlew.bat build` on Windows)

## Running the Application

1.  **Run from IDE**: Import the project into your IDE (IntelliJ IDEA, Eclipse, VS Code with Java extensions) and run the `Demo2Application` class.
2.  **Run using Gradle**:
    ```bash
    ./gradlew bootRun
    ```
    (Use `gradlew.bat bootRun` on Windows)

The application will start, typically on `http://localhost:8080`.

## API Endpoints

The application exposes RESTful APIs for various functionalities. Key endpoint groups include:

- `/api/auth/**`: Authentication (login, Google OAuth2)
- `/api/users/**`: User registration, profile management, fund operations
- `/api/otp/**`: OTP generation and verification (SMS)
- `/api/email/**`: Email OTP generation and verification
- `/api/trades/**`: Trade execution and history
- `/api/portfolio/**`: Portfolio management
- `/api/watchlist/**`: Watchlist operations
- `/api/stocks/**`: Stock data retrieval
- `/api/news/**`: Market news
- `/api/payment/**`: Payment processing

_(Consider adding a link to Swagger UI or OpenAPI documentation if you generate it)_

## Running Tests

Execute the tests using Gradle:

```bash
./gradlew test
```

(Use `gradlew.bat test` on Windows)

Test reports can be found in `build/reports/tests/test/index.html`.

## Configuration Reference

Refer to `src/main/resources/application.properties` for detailed configuration options related to database, security, JWT, OAuth2, external APIs, and server settings.
