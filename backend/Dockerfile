# Build Stage
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app

# Copy dependency definition
COPY pom.xml .

# Fetch dependencies (cached step)
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN MAVEN_OPTS="-Xmx512m" mvn clean package -DskipTests -B

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose default backend port
EXPOSE 8080

# Run Spring Boot with optimized JVM settings for container/low-memory environments
ENV JAVA_TOOL_OPTIONS="-XX:+UseSerialGC -Xmx384m -Xms256m -XX:MaxMetaspaceSize=128m"
ENTRYPOINT ["java", "-jar", "app.jar"]
