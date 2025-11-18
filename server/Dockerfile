# Use lightweight Java 17 image
FROM eclipse-temurin:17-jdk-jammy

# Set working directory inside container
WORKDIR /app

# Copy the JAR file built by Maven
COPY target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Healthcheck for Render
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD curl -f http://localhost:8080/healthz || exit 1

# Start Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
