# syntax=docker/dockerfile:1

FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/backend-1.0.0.jar app.jar

ENV PORT=4000
EXPOSE 4000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]
