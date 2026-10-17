FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /workspace
COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:17-jre-alpine

RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /workspace/target/admin-api-*.jar app.jar

USER app
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
